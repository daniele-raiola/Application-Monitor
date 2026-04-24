/**
 * DocumentChecklist.js
 * Document checklist component with add/remove/toggle functionality
 */

import { toast } from './Toast.js';
import { updateDocumentStatus, addDocument, removeDocument } from '../services/app-service.js';

export class DocumentChecklist {
  constructor(appId, documents = [], options = {}) {
    this.appId = appId;
    this.documents = documents;
    this.onChange = options.onChange || (() => {});
  }

  /**
   * Render the checklist
   */
  render() {
    const container = document.createElement('div');
    container.className = 'checklist';

    const completedCount = this.documents.filter(d => d.completed).length;
    const totalCount = this.documents.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Header
    const header = document.createElement('div');
    header.className = 'checklist__header';

    const title = document.createElement('span');
    title.className = 'checklist__title';
    title.textContent = 'Required Documents';

    const count = document.createElement('span');
    count.className = 'checklist__count';
    count.textContent = `${completedCount}/${totalCount} complete`;

    header.appendChild(title);
    header.appendChild(count);
    container.appendChild(header);

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'checklist__progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'checklist__progress-fill';
    progressFill.style.width = `${progressPercent}%`;
    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);

    // Items
    const items = document.createElement('div');
    items.className = 'checklist__items';

    this.documents.forEach(doc => {
      const item = this.createItem(doc);
      items.appendChild(item);
    });

    container.appendChild(items);

    // Add form
    const addForm = this.createAddForm();
    container.appendChild(addForm);

    return container;
  }

  /**
   * Create a single checklist item
   */
  createItem(doc) {
    const item = document.createElement('div');
    item.className = `checklist__item ${doc.completed ? 'checklist__item--completed' : ''}`;
    item.dataset.docId = doc.id;

    const checkbox = document.createElement('div');
    checkbox.className = 'checklist__checkbox';
    if (doc.completed) {
      checkbox.textContent = '✓';
    }

    const label = document.createElement('span');
    label.className = 'checklist__item-label';
    label.textContent = doc.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'checklist__item-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove document';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleRemove(doc.id);
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(removeBtn);

    // Toggle on click
    item.addEventListener('click', () => this.handleToggle(doc));

    return item;
  }

  /**
   * Create the add document form
   */
  createAddForm() {
    const form = document.createElement('div');
    form.className = 'checklist__add-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'checklist__input';
    input.placeholder = 'Add new document...';
    input.id = `doc-input-${this.appId}`;

    const btn = document.createElement('button');
    btn.className = 'checklist__add-btn';
    btn.textContent = '+';
    btn.title = 'Add document';
    btn.addEventListener('click', () => {
      const name = input.value.trim();
      if (name) {
        this.handleAdd(name);
        input.value = '';
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const name = input.value.trim();
        if (name) {
          this.handleAdd(name);
          input.value = '';
        }
      }
    });

    form.appendChild(input);
    form.appendChild(btn);

    return form;
  }

  /**
   * Toggle document completion
   */
  handleToggle(doc) {
    const newStatus = !doc.completed;
    const success = updateDocumentStatus(this.appId, doc.id, newStatus);
    if (success) {
      this.onChange();
      if (newStatus) {
        toast.success('Document completed!');
      }
    }
  }

  /**
   * Add a new document
   */
  handleAdd(name) {
    const success = addDocument(this.appId, name);
    if (success) {
      toast.success('Document added');
      this.onChange();
    }
  }

  /**
   * Remove a document
   */
  handleRemove(docId) {
    if (confirm('Remove this document?')) {
      const success = removeDocument(this.appId, docId);
      if (success) {
        toast.info('Document removed');
        this.onChange();
      }
    }
  }
}