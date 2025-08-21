import { Controller, Get, Header, Param, Query } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

@Controller('embed')
export class EmbedsController {
  constructor(private prisma: PrismaService) {}

  // JS loader that injects an iframe with the correct layout
  @Get('script/:tenantSlug.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  async script(@Param('tenantSlug') slug: string) {
    const apiBase = process.env.PUBLIC_API_BASE_URL || ''
    return `;(function(){
  function init(){
    var els = document.querySelectorAll('[data-truetestify]');
    for(var i=0;i<els.length;i++){
      var el = els[i];
      var layout = el.getAttribute('data-layout')||'GRID';
      var src = '${apiBase}/embed/${slug}/view?layout='+encodeURIComponent(layout);
      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.width = '100%';
      iframe.style.border = '0';
      iframe.allow = 'autoplay; fullscreen;';
      el.appendChild(iframe);
    }
  }
  if(document.readyState==='complete' || document.readyState==='interactive'){init()}else{document.addEventListener('DOMContentLoaded', init)}
})();`
  }

  // Public view consumed by iframe to render data as JSON (frontend can style)
  @Get(':tenantSlug/view')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' https://*.amazonaws.com https://*.s3.amazonaws.com https://commondatastorage.googleapis.com https://*.cloudfront.net; img-src 'self' data: https:; connect-src 'self'")
  async view(
    @Param('tenantSlug') slug: string,
    @Query('layout') layout?: 'GRID' | 'CAROUSEL' | 'SPOTLIGHT' | 'WALL' | 'FLOATING_BUBBLE',
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) return '<!doctype html><html><body>Tenant not found</body></html>'
    await this.prisma.analyticsEvent.create({ data: { tenantId: tenant.id, type: 'WIDGET_VIEW', meta: { layout: layout || 'GRID' } } })

    const apiBase = process.env.PUBLIC_API_BASE_URL || ''
    const safeLayout = (layout || 'GRID').toUpperCase()
    const styles = `:root{--tt-primary:${tenant.brandPrimaryHex||'#1e3a8a'};--tt-accent:${tenant.brandAccentHex||'#f97316'};}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system;}.tt-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));padding:12px}.tt-card{border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04)}.tt-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--tt-primary);color:#fff}.tt-title{font-weight:600;font-size:14px}.tt-media video,.tt-media audio{width:100%;display:block;background:#000}.tt-text{padding:8px 12px;color:#111827}.tt-carousel{display:flex;gap:12px;overflow-x:auto;padding:12px}.tt-spotlight{padding:12px}.tt-bubble{position:fixed;right:16px;bottom:16px;background:var(--tt-accent);color:#fff;border-radius:999px;padding:10px 14px;box-shadow:0 6px 20px rgba(0,0,0,.2);cursor:pointer}a,button{cursor:pointer}`
    
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${styles}</style></head><body><div id="app"></div><script src="${apiBase}/embed/widget.js?slug=${slug}&layout=${safeLayout}&logo=${encodeURIComponent(tenant.logoUrl||'')}"></script></body></html>`
    return html
  }

  // External JavaScript file to avoid CSP issues
  @Get('widget.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  async widgetJs(
    @Query('slug') slug: string,
    @Query('layout') layout: string,
    @Query('logo') logo: string,
  ) {
    const apiBase = process.env.PUBLIC_API_BASE_URL || ''
    return `
(function(){
  var layout='${layout}';
  var slug='${slug}';
  var logoUrl='${logo}';
  var apiBase='${apiBase}';
  
  function loadWidget(layoutType) {
    var root = document.getElementById('app');
    root.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">Loading...</div>';
    
    // Update URL without page reload
    var url = new URL(window.location);
    url.searchParams.set('layout', layoutType);
    window.history.pushState({}, '', url);
    
    fetch(apiBase+'/widgets/'+slug+'?layout='+encodeURIComponent(layoutType)).then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(data){
      var root=document.getElementById('app');
      // Clear loading placeholder before rendering
      root.innerHTML = '';
      function card(item){
        var el=document.createElement('div'); el.className='tt-card';
        var head=document.createElement('div'); head.className='tt-header'; 
        head.innerHTML='<img src="'+logoUrl+'" alt="" style="height:20px"> <div class="tt-title">'+(item.title||item.authorName||'Review')+'</div>';
        var media=document.createElement('div'); media.className='tt-media';
        if(item.videoUrl){
          var v=document.createElement('video'); v.src=item.videoUrl; v.controls=true; v.playsInline=true; media.appendChild(v);
        } else if(item.audioUrl){
          var a=document.createElement('audio'); a.src=item.audioUrl; a.controls=true; media.appendChild(a);
        } else { 
          media.innerHTML='<div class="tt-text">'+(item.text||'')+'</div>'
        }
        el.appendChild(head); el.appendChild(media);
        if(item.text){
          var t=document.createElement('div'); t.className='tt-text'; t.textContent=item.text; el.appendChild(t);
        }
        return el;
      }
      
      // Check if we have any testimonials (either items array or featured item)
      var hasTestimonials = (data.items && data.items.length > 0) || (data.featured) || (data.count && data.count > 0);
      
      if (!hasTestimonials) {
        root.innerHTML='<div style="padding:20px;text-align:center;color:#666;">No testimonials available yet</div>';
        return;
      }
      
      if(data.type==='GRID'||data.type==='WALL'){
        var g=document.createElement('div'); g.className='tt-grid';
        data.items.forEach(function(i){g.appendChild(card(i))}); root.appendChild(g);
      } else if(data.type==='CAROUSEL'){
        var c=document.createElement('div'); c.className='tt-carousel';
        data.items.forEach(function(i){c.appendChild(card(i))}); root.appendChild(c);
      } else if(data.type==='SPOTLIGHT'){
        var s=document.createElement('div'); s.className='tt-spotlight';
        if(data.featured){s.appendChild(card(data.featured))} 
        // Also show others if available
        if(data.others && data.others.length > 0){
          var othersDiv = document.createElement('div'); othersDiv.className='tt-grid';
          data.others.forEach(function(i){othersDiv.appendChild(card(i))});
          s.appendChild(othersDiv);
        }
        root.appendChild(s);
      } else if(data.type==='FLOATING_BUBBLE'){
        var b=document.createElement('div'); b.className='tt-bubble'; 
        b.textContent='Testimonials ('+data.count+')'; 
        // Make it clickable to show testimonials
        b.style.cursor='pointer';
        b.onclick=function(){
          // Create a modal or expand to show testimonials
          var modal=document.createElement('div');
          modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;';
          modal.innerHTML='<div style="background:white;padding:20px;border-radius:8px;max-width:80%;max-height:80%;overflow:auto;"><div style="text-align:right;margin-bottom:10px;"><button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">×</button></div><div id="modalContent"></div></div>';
          document.body.appendChild(modal);
          
          // Load testimonials in modal
          fetch(apiBase+'/widgets/'+slug+'?layout=GRID').then(function(r){
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          }).then(function(modalData){
            var modalContent=document.getElementById('modalContent');
            // Clear previous modal content
            modalContent.innerHTML = '';
            if(modalData.items && modalData.items.length > 0){
              var grid=document.createElement('div'); grid.className='tt-grid';
              modalData.items.forEach(function(i){grid.appendChild(card(i))});
              modalContent.appendChild(grid);
            } else {
              modalContent.innerHTML='<div style="text-align:center;color:#666;">No testimonials available</div>';
            }
          }).catch(function(){
            document.getElementById('modalContent').innerHTML='<div style="text-align:center;color:#666;">Failed to load testimonials</div>';
          });
        };
        root.appendChild(b);
      }
    }).catch(function(error){ 
      console.error('Widget load error:', error);
      var app = document.getElementById('app');
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        app.innerHTML='<div style="padding:20px;text-align:center;color:#666;">Failed to load widget</div>';
      } else {
        app.innerHTML='<div style="padding:20px;text-align:center;color:#666;">No testimonials available yet</div>';
      }
    });
  }
  
  // Add layout switcher

  var switcher = document.createElement('div');
  switcher.style.cssText = 'position:fixed;top:10px;right:10px;background:white;border:1px solid #ccc;border-radius:4px;padding:8px;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
  switcher.innerHTML = '<div style="font-size:12px;margin-bottom:4px;">Layout:</div>' +
    '<select style="font-size:12px;padding:2px;" id="layoutSelect">' +
    '<option value="GRID" '+(layout==='GRID'?'selected':'')+'>Grid</option>' +
    '<option value="CAROUSEL" '+(layout==='CAROUSEL'?'selected':'')+'>Carousel</option>' +
    '<option value="SPOTLIGHT" '+(layout==='SPOTLIGHT'?'selected':'')+'>Spotlight</option>' +
    '<option value="WALL" '+(layout==='WALL'?'selected':'')+'>Wall</option>' +
    '<option value="FLOATING_BUBBLE" '+(layout==='FLOATING_BUBBLE'?'selected':'')+'>Bubble</option>' +
    '</select>';
  document.body.appendChild(switcher);
  
  // Add event listener for layout switching
  document.getElementById('layoutSelect').addEventListener('change', function() {
    loadWidget(this.value);
  });
  
  // Listen for URL changes (back/forward buttons)
  window.addEventListener('popstate', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var newLayout = urlParams.get('layout') || 'GRID';
    // Update dropdown to match URL
    var select = document.getElementById('layoutSelect');
    if (select) select.value = newLayout;
    loadWidget(newLayout);
  });
  
  // Function to get layout from URL
  function getLayoutFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('layout') || layout;
  }
  
  // Load initial layout from URL
  var initialLayout = getLayoutFromURL();
  loadWidget(initialLayout);
})();`
  }
}


