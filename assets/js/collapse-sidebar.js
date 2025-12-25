// 默认折叠侧边栏顶级目录（除了包含当前活动页面的目录）
(function() {
  'use strict';
  
  function collapseTopLevelMenus() {
    // 查找侧边栏菜单容器
    const sidebar = document.querySelector('.td-sidebar-nav');
    if (!sidebar) {
      return;
    }
    
    // 查找所有顶级菜单项（直接子级的 li 元素，且包含子菜单）
    const topLevelItems = sidebar.querySelectorAll('> ul > li');
    
    topLevelItems.forEach(function(item) {
      // 检查是否有子菜单
      const children = item.querySelector('ul.children');
      if (!children) {
        return; // 没有子菜单，跳过
      }
      
      // 检查当前菜单项是否包含活动页面（active）
      const hasActive = item.querySelector('.active') !== null;
      
      // 如果没有活动页面，则折叠该菜单项
      if (!hasActive) {
        // 移除 show 类来折叠菜单（Bootstrap collapse 使用 show 类）
        children.classList.remove('show');
        // 移除父级 li 的 active 类（如果存在）
        item.classList.remove('active');
        
        // 查找并更新切换按钮的状态（Bootstrap collapse 使用 checkbox）
        const toggle = item.querySelector('input[type="checkbox"]');
        if (toggle) {
          toggle.checked = false;
        }
        
        // 也处理可能的按钮切换器
        const toggleButton = item.querySelector('button[data-toggle="collapse"], button[data-bs-toggle="collapse"]');
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
  
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collapseTopLevelMenus);
  } else {
    // DOM 已经加载完成，直接执行
    collapseTopLevelMenus();
  }
  
  // 如果 Docsy 的菜单是异步加载的，可以延迟执行
  setTimeout(collapseTopLevelMenus, 100);
  setTimeout(collapseTopLevelMenus, 500);
})();

