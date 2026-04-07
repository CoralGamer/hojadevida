$files = Get-ChildItem -Path "pages\servicios" -Filter "*.html"
foreach ($file in $files) {
    # Skip index.html if you already updated it, or just let it replace.
    $content = Get-Content $file.FullName -Raw
    
    # CSS
    $content = $content -replace '/hojadevida/src/style\.css', '../../src/style.css'
    $content = $content -replace '\.\./\.\./style\.css', '../../src/style.css'
    
    # JS
    $content = $content -replace '/hojadevida/src/js/blog-renderer\.js', '../../src/js/blog-renderer.js'
    $content = $content -replace '\.\./\.\./js/blog-renderer\.js', '../../src/js/blog-renderer.js'
    
    # Images (fix the path to include src/)
    $content = $content -replace '\.\./\.\./assets/', '../../src/assets/'
    
    # Links
    $content = $content -replace 'href="index\.html"', 'href="index.html"' # keep relative if same folder
    # Or make it absolute if preferred but relative is safer for local dev without base
    
    Set-Content -Path $file.FullName -Value $content
}
