/**
 * ApplicationForm.js
 * Add/Edit Application form component
 */

import { Modal } from './Modal.js';
import { toast } from './Toast.js';
import { createApplication, updateApplication } from '../services/app-service.js';
import { isFuture, getTodayISO } from '../utils/date-utils.js';
import { DOCUMENT_TYPES } from '../utils/constants.js';

export class ApplicationForm {
  constructor(app = null, onSave = () => {}) {
    this.app = app;
    this.onSave = onSave;
    this.modal = null;
  }

  /**
   * Open the form modal
   */
  open() {
    const isEdit = !!this.app;
    const title = isEdit ? 'Edit Application' : 'Add Application';
    
    this.modal = new Modal(title);
    
    const form = this.renderForm();
    this.modal.setContentElement(form);
    
    this.modal.addActions([
      {
        label: isEdit ? 'Save Changes' : 'Add Application',
        type: 'primary',
        onClick: () => this.handleSubmit(form)
      },
      {
        label: 'Cancel',
        type: 'secondary',
        onClick: () => this.modal.close()
      }
    ]);
    
    this.modal.open();
  }

  /**
   * Render the form HTML
   */
  renderForm() {
    const form = document.createElement('form');
    form.className = 'application-form';
    form.id = 'application-form';
    form.noValidate = true;
    
    // University name (required)
    const uniGroup = document.createElement('div');
    uniGroup.className = 'form-group';
    
    const uniLabel = document.createElement('label');
    uniLabel.className = 'form-label';
    uniLabel.textContent = 'University Name *';
    
    const uniInput = document.createElement('input');
    uniInput.type = 'text';
    uniInput.className = 'form-input';
    uniInput.id = 'universityName';
    uniInput.name = 'universityName';
    uniInput.placeholder = 'e.g., ETH Zurich';
    uniInput.required = true;
    uniInput.value = this.app?.universityName || '';
    
    uniGroup.appendChild(uniLabel);
    uniGroup.appendChild(uniInput);
    form.appendChild(uniGroup);
    
    // Program name (required)
    const progGroup = document.createElement('div');
    progGroup.className = 'form-group';
    
    const progLabel = document.createElement('label');
    progLabel.className = 'form-label';
    progLabel.textContent = 'Program Name *';
    
    const progInput = document.createElement('input');
    progInput.type = 'text';
    progInput.className = 'form-input';
    progInput.id = 'programName';
    progInput.name = 'programName';
    progInput.placeholder = 'e.g., PhD in Machine Learning';
    progInput.required = true;
    progInput.value = this.app?.programName || '';
    
    progGroup.appendChild(progLabel);
    progGroup.appendChild(progInput);
    form.appendChild(progGroup);
    
    // Submission deadline (required)
    const deadGroup = document.createElement('div');
    deadGroup.className = 'form-group';
    
    const deadLabel = document.createElement('label');
    deadLabel.className = 'form-label';
    deadLabel.textContent = 'Submission Deadline *';
    
    const deadInput = document.createElement('input');
    deadInput.type = 'date';
    deadInput.className = 'form-input';
    deadInput.id = 'submissionDeadline';
    deadInput.name = 'submissionDeadline';
    deadInput.required = true;
    deadInput.value = this.app?.submissionDeadline || '';
    deadInput.min = getTodayISO();
    
    const deadHint = document.createElement('span');
    deadHint.className = 'form-hint';
    deadHint.textContent = 'Must be a future date';
    
    deadGroup.appendChild(deadLabel);
    deadGroup.appendChild(deadInput);
    deadGroup.appendChild(deadHint);
    form.appendChild(deadGroup);
    
    // Department (optional)
    const deptGroup = document.createElement('div');
    deptGroup.className = 'form-group';
    
    const deptLabel = document.createElement('label');
    deptLabel.className = 'form-label';
    deptLabel.textContent = 'Department';
    
    const deptInput = document.createElement('input');
    deptInput.type = 'text';
    deptInput.className = 'form-input';
    deptInput.id = 'department';
    deptInput.name = 'department';
    deptInput.placeholder = 'e.g., Dept. of Computer Science';
    deptInput.value = this.app?.department || '';
    
    deptGroup.appendChild(deptLabel);
    deptGroup.appendChild(deptInput);
    form.appendChild(deptGroup);
    
    // Country (optional)
    const countryGroup = document.createElement('div');
    countryGroup.className = 'form-group';
    
    const countryLabel = document.createElement('label');
    countryLabel.className = 'form-label';
    countryLabel.textContent = 'Country';
    
    const countryInput = document.createElement('input');
    countryInput.type = 'text';
    countryInput.className = 'form-input';
    countryInput.id = 'country';
    countryInput.name = 'country';
    countryInput.placeholder = 'e.g., CH';
    countryInput.maxLength = 2;
    countryInput.value = this.app?.country || '';
    
    countryGroup.appendChild(countryLabel);
    countryGroup.appendChild(countryInput);
    form.appendChild(countryGroup);
    
    // Portal URL (optional)
    const urlGroup = document.createElement('div');
    urlGroup.className = 'form-group';
    
    const urlLabel = document.createElement('label');
    urlLabel.className = 'form-label';
    urlLabel.textContent = 'Application Portal URL';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'form-input';
    urlInput.id = 'applicationPortalURL';
    urlInput.name = 'applicationPortalURL';
    urlInput.placeholder = 'https://...';
    urlInput.value = this.app?.applicationPortalURL || '';
    
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);
    form.appendChild(urlGroup);
    
    // Tags (optional)
    const tagsGroup = document.createElement('div');
    tagsGroup.className = 'form-group';
    
    const tagsLabel = document.createElement('label');
    tagsLabel.className = 'form-label';
    tagsLabel.textContent = 'Tags';
    
    const tagsInput = document.createElement('input');
    tagsInput.type = 'text';
    tagsInput.className = 'form-input';
    tagsInput.id = 'tags';
    tagsInput.name = 'tags';
    tagsInput.placeholder = 'fully-funded, EU, top-10 (comma-separated)';
    tagsInput.value = this.app?.tags?.join(', ') || '';
    
    const tagsHint = document.createElement('span');
    tagsHint.className = 'form-hint';
    tagsHint.textContent = 'Separate multiple tags with commas';
    
    tagsGroup.appendChild(tagsLabel);
    tagsGroup.appendChild(tagsInput);
    tagsGroup.appendChild(tagsHint);
    form.appendChild(tagsGroup);
    
    return form;
  }

  /**
   * Handle form submission
   */
  handleSubmit(form) {
    const formData = new FormData(form);
    
    // Validate required fields
    const universityName = formData.get('universityName')?.trim();
    const programName = formData.get('programName')?.trim();
    const submissionDeadline = formData.get('submissionDeadline')?.trim();
    
    if (!universityName) {
      toast.error('University name is required');
      document.getElementById('universityName').focus();
      return;
    }
    
    if (!programName) {
      toast.error('Program name is required');
      document.getElementById('programName').focus();
      return;
    }
    
    if (!submissionDeadline) {
      toast.error('Submission deadline is required');
      document.getElementById('submissionDeadline').focus();
      return;
    }
    
    // Validate deadline is future
    if (!isFuture(submissionDeadline)) {
      toast.error('Deadline must be a future date');
      document.getElementById('submissionDeadline').focus();
      return;
    }
    
    // Parse tags
    const tagsStr = formData.get('tags') || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    // Build application object
    const fields = {
      universityName,
      programName,
      submissionDeadline,
      department: formData.get('department')?.trim() || '',
      country: formData.get('country')?.trim()?.toUpperCase() || '',
      applicationPortalURL: formData.get('applicationPortalURL')?.trim() || '',
      tags
    };
    
    try {
      if (this.app) {
        // Update existing
        updateApplication(this.app.id, fields);
        toast.success('Application updated!');
      } else {
        // Create new
        createApplication(fields);
        toast.success('Application added! Set your deadline next.');
      }
      
      this.onSave();
      this.modal.close();
    } catch (err) {
      console.error('Error saving application:', err);
      toast.error('Failed to save application');
    }
  }
}