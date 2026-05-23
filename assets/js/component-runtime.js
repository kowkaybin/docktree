/**
 * Author: Kay Bin (vibe Gemini 20260521)
 * Docktree Runtime SDK - Sandbox Component Execution Engine
 */
class DocktreeComponent {
    constructor(nodeId, props = {}) {
        this.nodeId = nodeId;
        this.props = props;
        this.root = document.querySelector(`[data-dt-id="${nodeId}"]`);
        this._cleanups = [];
    }

    /**
     * Scope-isolated DOM selector
     */
    find(selector) {
        if (!this.root) return [];
        return Array.from(this.root.querySelectorAll(selector));
    }

    /**
     * Managed Event Listener (Prevents Zombie Listeners on Re-renders)
     */
    on(elements, event, handler) {
        if (!elements) return;
        const targetEls = (elements instanceof NodeList || Array.isArray(elements)) ? elements : [elements];
        
        targetEls.forEach(el => {
            el.addEventListener(event, handler);
            this._cleanups.push(() => el.removeEventListener(event, handler));
        });
    }

    /**
     * Lifecycle Hook: Executed upon instantiation
     */
    init() {
        // Overridden by component instances
    }

    /**
     * Lifecycle Hook: Safely cleans up memory/events
     */
    destroy() {
        this._cleanups.forEach(cleanupFn => cleanupFn());
        this._cleanups = [];
    }
}

// Global Sandbox Registry
window.DocktreeComponent = DocktreeComponent;
window.dtActiveComponents = window.dtActiveComponents || {};

// Evaluation Bootstrapper
window.docktreeBootComponent = function(nodeId, scriptContent, propsJson) {
    // 1. Teardown existing instance if present
    if (window.dtActiveComponents[nodeId]) {
        window.dtActiveComponents[nodeId].destroy();
        delete window.dtActiveComponents[nodeId];
    }

    if (!scriptContent || scriptContent.trim() === '') return;

    // 2. Safely parse props
    let props = {};
    try {
        props = JSON.parse(propsJson || '{}');
    } catch(e) {}

    // 3. Compile and sandbox script execution via Dynamic Class
    try {
        const ComponentClass = new Function('DocktreeComponent', `
            return class extends DocktreeComponent {
                init() {
                    ${scriptContent}
                }
            }
        `)(DocktreeComponent);

        const instance = new ComponentClass(nodeId, props);
        window.dtActiveComponents[nodeId] = instance;
        instance.init();
    } catch (e) {
        console.error(`[Docktree Sandbox] Error compiling component ${nodeId}:`, e);
    }
};