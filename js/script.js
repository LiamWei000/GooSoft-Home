/* js/script.js
   Progressive enhancements:
   - Enable JS-specific behaviors (set data attribute)
   - Mobile nav toggle
   - Portfolio filtering (enhancement only)
   - Accessible modal (inject content from <details>)
   - Manage focus trap and keyboard (ESC to close)
*/

(() => {
    // mark JS-enabled (for CSS/behavior differences)
    document.documentElement.setAttribute('data-js-enabled', 'true');

    /* --------- Utilities ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* --------- Mobile Nav Toggle ---------- */
    const navToggle = $('#navToggle');
    const mainNav = $('#mainNav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            // toggle nav visibility
            if (!expanded) {
                mainNav.style.display = 'block';
            } else {
                mainNav.style.display = '';
            }
        });
    }

    /* --------- Portfolio Filtering (progressive) ---------- */
    const filterButtons = $$('.filter-btn');
    const projects = $$('.project');

    function applyFilter(filter) {
        projects.forEach((p) => {
            const cat = p.dataset.category || 'all';
            if (filter === 'all' || cat === filter) {
                p.style.display = '';
            } else {
                p.style.display = 'none';
            }
        });
        filterButtons.forEach((btn) => {
            btn.setAttribute('aria-pressed', btn.dataset.filter === filter ? 'true' : 'false');
        });
    }

    if (filterButtons.length && projects.length) {
        // add dataset for each button (use provided attribute)
        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter || 'all';
                applyFilter(filter);
            });
        });
    }

    /* --------- Accessible modal (use <details> as fallback content) ---------- */
    const modal = $('#modal');
    const modalContent = $('#modalContent');
    const modalClose = $('#modalClose');
    const modalOverlay = modal ? modal.querySelector('[data-dismiss-modal]') : null;

    // utility: trap focus within modal
    function trapFocus(container) {
        const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        function handleKey(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            } else if (e.key === 'Escape') {
                closeModal();
            }
        }
        container.addEventListener('keydown', handleKey);
        return () => container.removeEventListener('keydown', handleKey);
    }

    let restoreFocusTo = null;
    let releaseTrap = null;

    function openModal(contentNode, title) {
        if (!modal) return;
        // save focus
        restoreFocusTo = document.activeElement;
        // fill content
        modalContent.innerHTML = '';
        if (typeof contentNode === 'string') {
            modalContent.innerHTML = contentNode;
        } else {
            modalContent.appendChild(contentNode.cloneNode(true));
        }
        // show
        modal.hidden = false;
        modal.removeAttribute('aria-hidden');
        // focus modal content
        const focusable = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        else modalContent.focus();

        // trap
        releaseTrap = trapFocus(modal);

        // prevent background scrolling
        document.documentElement.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');

        // restore focus
        if (restoreFocusTo && typeof restoreFocusTo.focus === 'function') {
            restoreFocusTo.focus();
        }
        restoreFocusTo = null;

        // release trap
        if (typeof releaseTrap === 'function') releaseTrap();
        releaseTrap = null;

        document.documentElement.style.overflow = '';
    }

    // handle opening modal when project link clicked
    const projectLinks = $$('.project__link');
    projectLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            // by default, anchor points to a details id; prevent default to show modal and still support fallback
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const detailsId = href.replace('#', '');
                const details = document.getElementById(detailsId);
                const detailsBody = details ? details.querySelector('.project__details-body') || details : null;

                if (detailsBody && modal) {
                    e.preventDefault();
                    openModal(detailsBody, '');
                }
            }
        });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // close modal on ESC at document level
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.hidden) {
            closeModal();
        }
    });

    /* Accessibility: ensure details <summary> toggles update aria-expanded on anchor links */
    const projectAnchors = $$('.project__link');
    projectAnchors.forEach((a) => {
        a.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                a.click();
            }
        });
    });

    /* Small progressive enhancement for links to details: update aria-expanded when details are opened natively */
    const detailsElements = $$('.project__details');
    detailsElements.forEach((d) => {
        const summary = d.querySelector('summary');
        if (!summary) return;
        summary.addEventListener('toggle', () => {
            // update any anchor that controls this details
            const id = d.id;
            const controlling = document.querySelector(`a[aria-controls="${id}"]`);
            if (controlling) {
                controlling.setAttribute('aria-expanded', String(d.open));
            }
        });
    });

    /* Optional: Lazy enhancement to preload the image used for hero at larger sizes for high-DPR */
    const heroImg = document.querySelector('.hero__image img');
    if (heroImg) {
        // ensure decoding is set; browsers manage best effort.
    }

})();