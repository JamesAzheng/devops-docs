// Hide taxonomy cloud, categories, and tags in sidebar
(function() {
  'use strict';
  
  function hideTaxonomyElements() {
    // Function to check if element contains taxonomy-related text
    function isTaxonomySection(element) {
      const text = (element.textContent || '').trim();
      const taxonomyKeywords = [
        'Tag Cloud', 'Categories', 'Tags',
        '标签云', '分类', '标签',
        'CATEGORIES', 'TAGS', 'TAG CLOUD'
      ];
      return taxonomyKeywords.some(keyword => text.includes(keyword));
    }
    
    // Hide elements by class name (more comprehensive list)
    const classSelectors = [
      '.td-sidebar-taxonomy',
      '.td-sidebar-taxonomy-cloud',
      '.taxonomy-cloud',
      '.taxonomy-cloud-section',
      '.td-sidebar-categories',
      '.categories-section',
      '.td-sidebar-tags',
      '.tags-section',
      '[class*="taxonomy"]',
      '[class*="category"]',
      '[class*="tag"]'
    ];
    
    classSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el && el.parentElement) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.overflow = 'hidden';
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
    
    // Hide sections containing taxonomy links (more comprehensive)
    const linkSelectors = [
      'a[href*="/tags/"]',
      'a[href*="/categories/"]',
      'a[href*="/tag/"]',
      'a[href*="/category/"]',
      'a[href*="tags"]',
      'a[href*="categories"]'
    ];
    
    linkSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        // Hide the link itself
        link.style.display = 'none';
        // Hide parent containers
        let parent = link.closest('section') || link.closest('div') || link.parentElement;
        while (parent && parent !== document.body) {
          if (parent.classList.contains('td-sidebar') || parent.closest('.td-sidebar')) {
            parent.style.display = 'none';
            parent.style.visibility = 'hidden';
            break;
          }
          parent = parent.parentElement;
        }
      });
    });
    
    // Hide sections by heading text (more comprehensive)
    const headingSelectors = ['.td-sidebar h5', '.td-sidebar h4', '.td-sidebar h3', '.td-sidebar h2'];
    headingSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(heading => {
        if (isTaxonomySection(heading)) {
          // Hide the heading
          heading.style.display = 'none';
          // Hide parent section
          let section = heading.closest('section') || heading.parentElement;
          while (section && section !== document.body) {
            if (section.tagName === 'SECTION' || section.classList.contains('td-sidebar')) {
              section.style.display = 'none';
              section.style.visibility = 'hidden';
              break;
            }
            section = section.parentElement;
          }
        }
      });
    });
    
    // Hide any section in sidebar that contains taxonomy-related content
    document.querySelectorAll('.td-sidebar section, .td-sidebar div').forEach(element => {
      if (isTaxonomySection(element)) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0';
        element.style.overflow = 'hidden';
      }
    });
    
    // Additional: Find and hide sections with specific text patterns
    const sidebar = document.querySelector('.td-sidebar');
    if (sidebar) {
      const walker = document.createTreeWalker(
        sidebar,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text === 'Categories' || text === 'Tags' || text === 'Tag Cloud' ||
            text === '分类' || text === '标签' || text === '标签云') {
          let parent = node.parentElement;
          while (parent && parent !== sidebar) {
            if (parent.tagName === 'SECTION' || parent.tagName === 'DIV') {
              parent.style.display = 'none';
              parent.style.visibility = 'hidden';
              break;
            }
            parent = parent.parentElement;
          }
        }
      }
    }
  }
  
  // Run immediately
  hideTaxonomyElements();
  
  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideTaxonomyElements);
  }
  
  // Run multiple times to catch dynamically loaded content
  setTimeout(hideTaxonomyElements, 100);
  setTimeout(hideTaxonomyElements, 300);
  setTimeout(hideTaxonomyElements, 500);
  setTimeout(hideTaxonomyElements, 1000);
  
  // Use MutationObserver to watch for DOM changes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      hideTaxonomyElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();

