<template>
  <router-view />
</template>

<script>
export default { name: 'App' }
</script>

<style>

  * {
  box-sizing: border-box;
}

body {
  margin: 0;
  overflow-x: hidden;
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }


:root {
  --mint:        #A9E9AD;
  --mint-mid:    #86d98b;
  --mint-dim:    #d9f5db;
  --mint-ghost:  #f0faf1;
  --forest:      #657D65;
  --forest-deep: #3d5240;
  --forest-ink:  #243328;
  --peach:       #FFCFC1;
  --peach-dim:   #ffeae4;
  --peach-mid:   #f0a090;
  --stone:       #757872;
  --stone-dim:   #e8e9e6;
  --stone-ghost: #f5f5f3;
  --bg-page:     #f2f4f1;
  --bg-card:     #ffffff;
  --bg-sidebar:  #243328;
  --text-1:      #1a211b;
  --text-2:      #4e5e4f;
  --text-3:      #8a9a8b;
  --text-inv:    #ffffff;
  --border:      #e4e8e3;
  --border-s:    #cdd4cc;
  --shadow-xs:   0 1px 3px rgba(36,51,40,.06);
  --shadow-sm:   0 2px 8px rgba(36,51,40,.08);
  --shadow-md:   0 4px 20px rgba(36,51,40,.10);
  --r-xs: 6px; --r-sm: 10px; --r-md: 14px; --r-lg: 18px;
  --sidebar-w: 240px;
  --topbar-h:  62px;
}

html { font-size: 15px; -webkit-font-smoothing: antialiased; }
body { font-family: 'Outfit', 'Segoe UI', sans-serif; background: var(--bg-page); color: var(--text-1); }
button { font-family: inherit; cursor: pointer; }
a { text-decoration: none; color: inherit; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: var(--border-s); border-radius: 4px; }
</style>
