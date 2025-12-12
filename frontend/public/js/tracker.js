/**
 * Spark Platform - Client-Side Analytics Tracker
 * 
 * Lightweight tracking script that:
 * - Tracks pageviews with UTM params
 * - Tracks custom events
 * - Generates session/visitor IDs
 * - Integrates with Google Tag Manager, GA4, Clarity, FB Pixel
 * 
 * Usage:
 * <script src="/js/tracker.js" data-site-id="your-site-id"></script>
 */

(function () {
    'use strict';

    // Get site ID from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-site-id]');
    const SITE_ID = scriptTag?.getAttribute('data-site-id');
    const API_BASE = scriptTag?.getAttribute('data-api-base') || '';

    if (!SITE_ID) {
        console.warn('[Spark Tracker] Missing data-site-id attribute');
        return;
    }

    // Generate or get visitor ID (persisted in localStorage)
    function getVisitorId() {
        let id = localStorage.getItem('spark_visitor_id');
        if (!id) {
            id = 'v_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('spark_visitor_id', id);
        }
        return id;
    }

    // Generate session ID (persisted in sessionStorage)
    function getSessionId() {
        let id = sessionStorage.getItem('spark_session_id');
        if (!id) {
            id = 's_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('spark_session_id', id);
        }
        return id;
    }

    const VISITOR_ID = getVisitorId();
    const SESSION_ID = getSessionId();

    // Track pageview
    function trackPageview() {
        const data = {
            site_id: SITE_ID,
            page_path: window.location.pathname + window.location.search,
            page_title: document.title,
            referrer: document.referrer,
            session_id: SESSION_ID,
            visitor_id: VISITOR_ID
        };

        fetch(API_BASE + '/api/track/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true
        }).catch(() => { });
    }

    // Track custom event
    window.sparkTrack = function (eventName, eventData = {}) {
        const data = {
            site_id: SITE_ID,
            event_name: eventName,
            event_category: eventData.category,
            event_label: eventData.label,
            event_value: eventData.value,
            page_path: window.location.pathname,
            session_id: SESSION_ID,
            visitor_id: VISITOR_ID,
            metadata: eventData.metadata || eventData
        };

        fetch(API_BASE + '/api/track/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true
        }).catch(() => { });

        // Also send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Send to Facebook Pixel if available
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', eventName, eventData);
        }
    };

    // Track conversion (lead form, etc.)
    window.sparkConversion = function (conversionType, value, options = {}) {
        const data = {
            site_id: SITE_ID,
            conversion_type: conversionType,
            value: value,
            source: options.source,
            campaign: options.campaign,
            gclid: new URLSearchParams(window.location.search).get('gclid'),
            fbclid: new URLSearchParams(window.location.search).get('fbclid'),
            send_to_google: options.sendToGoogle !== false,
            send_to_facebook: options.sendToFacebook !== false
        };

        fetch(API_BASE + '/api/track/conversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(() => { });
    };

    // Auto-track form submissions
    document.addEventListener('submit', function (e) {
        const form = e.target;
        if (form.tagName === 'FORM') {
            window.sparkTrack('form_submit', {
                category: 'engagement',
                label: form.id || form.name || 'unknown_form'
            });
        }
    });

    // Auto-track outbound link clicks
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link && link.hostname !== window.location.hostname) {
            window.sparkTrack('outbound_click', {
                category: 'engagement',
                label: link.href
            });
        }
    });

    // Track initial pageview
    if (document.readyState === 'complete') {
        trackPageview();
    } else {
        window.addEventListener('load', trackPageview);
    }

    // Track SPA navigation (for frameworks that use history API)
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(function () {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            trackPageview();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
