/**
 * Modal.js
 * Generic slide-up bottom sheet modal component
 */

export class Modal {
  constructor(title = 'Modal', content = '') {
    this.title = title;
    this.content = content;
    this.isOpen = false;
    this.handleKeydown = null;
  }

  /**
   * Render the modal DOM structure
   */
  render() {
    const container = document.getElementById('modal-container');
    container.innerHTML = ''; // Clear any existing

    // Scrim (backdrop)
    this.scrimEl = document.createElement('div');
    this.scrimEl.className = 'modal-scrim';
    this.scrimEl.addEventListener('click', () => this.close());
    container.appendChild(this.scrimEl);

    // Modal sheet
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-sheet';

    // Drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'modal-sheet__drag-handle';
    this.modalEl.appendChild(dragHandle);

    // Header
    const header = document.createElement('div');
    header.className = 'modal-sheet__header';

    const titleEl = document.createElement('h2');
    titleEl.className = 'modal-sheet__title';
    titleEl.textContent = this.title;
    header.appendChild(titleEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-sheet__close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(closeBtn);

    this.modalEl.appendChild(header);

    // Content area
    const contentEl = document.createElement('div');
    contentEl.className = 'modal-sheet__content';
    if (typeof this.content === 'string') {
      contentEl.innerHTML = this.content;
    } else if (this.content) {
      contentEl.appendChild(this.content);
    }
    this.modalEl.appendChild(contentEl);

    container.appendChild(this.modalEl);

    // Keyboard shortcut to close
    this.handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Open the modal
   */
  open() {
    this.render();
    this.isOpen = true;
    
    // Trigger animations
    requestAnimationFrame(() => {
      if (this.scrimEl) this.scrimEl.classList.add('modal-scrim--open');
      if (this.modalEl) this.modalEl.classList.add('modal-sheet--open');
    });
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    // Remove classes
    if (this.scrimEl) this.scrimEl.classList.remove('modal-scrim--open');
    if (this.modalEl) this.modalEl.classList.remove('modal-sheet--open');

    // Re-enable body scroll
    document.body.style.overflow = '';

    // Remove keydown listener
    if (this.handleKeydown) {
      document.removeEventListener('keydown', this.handleKeydown);
    }

    // Remove from DOM after animation
    setTimeout(() => {
      const container = document.getElementById('modal-container');
      if (container) container.innerHTML = '';
      this.modalEl = null;
      this.scrimEl = null;
    }, 300);
  }

  /**
   * Get the content container element
   */
  getContentElement() {
    return this.modalEl?.querySelector('.modal-sheet__content');
  }

  /**
   * Add action buttons to the modal
   */
  addActions(buttons) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'modal-sheet__actions';

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = `btn btn--${btn.type || 'primary'} btn--block`;
      button.textContent = btn.label;
      button.addEventListener('click', btn.onClick);
      actionsContainer.appendChild(button);
    });

    this.modalEl.appendChild(actionsContainer);
  }

  /**
   * Set a custom content element before opening
   */
  setContentElement(element) {
    // Store element and pass as content
    this.content = element;
  }
}