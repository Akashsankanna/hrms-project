<template>
  <AdminLayout page-title="Employees" add-label="Add Employee" :show-add="true" @add="openAddModal" @search="searchQuery = $event" >
    <template #hero-left>
      <div class="emp-hero-text">
        <p class="emp-hero-date">Team Overview</p>
        <h2 class="emp-hero-title">Employees at TWO ELEPHANTS TECHNOLOGIES LLP</h2>
        <p class="emp-hero-sub">Manage your workforce data and actions in one place.</p>
      </div>
    </template>
    <div class="content-body">
<div class="emp-top-box sticky-top-box">      
        <!-- EMPLOYEE STATS -->
        <div class="emp-stats-row">
          <div class="emp-stat-card">
            <p class="es-label">Total Employees</p>
            <h3 class="es-value">{{ totalEmployees }}</h3>
          </div>
          <div class="emp-stat-card">
            <p class="es-label">Active</p>
            <h3 class="es-value green">{{ activeEmployeesCount }}</h3>
          </div>
          <div class="emp-stat-card">
            <p class="es-label">Inactive</p>
            <h3 class="es-value red">{{ inactiveEmployeesCount }}</h3>
          </div>
          <div class="emp-stat-card">
            <p class="es-label">New This Month</p>
            <h3 class="es-value blue">{{ newThisMonthCount }}</h3>
          </div>
          <div class="emp-stat-card">
            <p class="es-label">Departments</p>
            <h3 class="es-value purple">{{ departmentCount }}</h3>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="toolbar">
          <div class="toolbar-left">
            <!-- View Toggle -->
            <div class="view-toggle">
              <button :class="['view-btn', viewMode === 'table' && 'active']" @click="viewMode = 'table'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                List
              </button>
             
            </div>

            <!-- Dept Filter -->
            <select v-model="filterDept" class="filter-select">
              <option  selected value="">All Departments</option>
              
  <option v-for="d in departmentOptions" :key="d.id" :value="d.name">{{ d.name }}</option>
            </select>

            <!-- Status Filter -->
            <select v-model="filterStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="toolbar-right">
  
          </div>
          </div>
      </div>

        <!-- TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="card table-wrapper">
           <div class="table-scroll">

          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" class="cb" v-model="selectAll" /></th>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="emp in filteredEmployees" :key="emp.id">
              <tr>
                <td><input type="checkbox" class="cb" v-model="emp.selected" /></td>
                <td>
                  <div class="emp-cell">
                    <div class="emp-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                    <div>
                      <p class="emp-name">{{ emp.name }}</p>
                      <p class="emp-email">{{ emp.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="id-cell">{{ emp.empId }}</td>
                <td><span class="dept-tag" :style="{ color: emp.deptColor, background: emp.deptBg }">{{ emp.dept }}</span></td>
                <td class="role-cell">{{ emp.role }}</td>
                <td class="date-cell">{{ emp.joinDate }}</td>
                <td class="phone-cell">{{ emp.phone }}</td>
                <td><span :class="['status-badge', emp.status === 'Active' ? 'active' : 'inactive']">{{ emp.status }}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn view" @click="openProfile(emp)" title="View Profile">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
</button>

          <button class="action-btn delete" @click="confirmDelete(emp)" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
          
                  </div>
                </td>
              </tr>

              <tr v-if="expandedEmpId === emp.id" class="details-row">
                <td colspan="9">
                  <div class="details-card">

                  </div>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
          </div>
          <!-- Pagination -->
          <div class="pagination">
            <span class="page-info">Showing {{ filteredEmployees.length }} of {{ employees.length }} employees</span>
            <div class="page-btns">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
              <button v-for="p in totalPages" :key="p" :class="['page-btn', p === currentPage && 'active']" @click="currentPage = p">{{ p }}</button>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
            </div>
          </div>
        </div>

        <!-- GRID VIEW -->
        <div v-if="viewMode === 'grid'" class="emp-grid">
          <div v-for="emp in filteredEmployees" :key="emp.id" class="emp-card" @click="toggleGridDetails(emp)">
            <div class="emp-card-header" :style="{ background: emp.color + '22' }">
              <div class="emp-card-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
              <span :class="['status-badge-sm', emp.status === 'Active' ? 'active' : 'inactive']">{{ emp.status }}</span>
            </div>
            <div class="emp-card-body">
              <h4 class="emp-card-name">{{ emp.name }}</h4>
              <p class="emp-card-role">{{ emp.role }}</p>
              <span class="dept-tag" :style="{ color: emp.deptColor, background: emp.deptBg }">{{ emp.dept }}</span>
              <div class="emp-card-meta">
                <div class="emp-meta-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  {{ emp.email }}
                </div>
                <div class="emp-meta-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 19v3"/></svg>
                  {{ emp.phone }}
                </div>
              </div>

              <div v-if="expandedEmpId === emp.id" class="emp-card-details">
                <div class="emp-detail-row"><span class="emp-detail-k">Employee Code</span><span class="emp-detail-v">{{ emp.employee_code || emp.empId || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Personal Email</span><span class="emp-detail-v">{{ emp.personal_email || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Work Email</span><span class="emp-detail-v">{{ emp.work_email || emp.email || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Department</span><span class="emp-detail-v">{{ emp.department_name || emp.dept || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Designation</span><span class="emp-detail-v">{{ emp.designation_name || emp.role || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Employment Type</span><span class="emp-detail-v">{{ emp.employment_type_lkp_name || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Office Location</span><span class="emp-detail-v">{{ emp.office_location_name || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">DOB</span><span class="emp-detail-v">{{ emp.date_of_birth || emp.dob || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">DOJ</span><span class="emp-detail-v">{{ emp.date_of_joining || emp.joinDate || '—' }}</span></div>
                <div class="emp-detail-row"><span class="emp-detail-k">Is Active</span><span class="emp-detail-v">{{ emp.is_active === false ? 'No' : 'Yes' }}</span></div>
              </div>

              <div class="emp-card-actions">
                <button class="card-action-btn view-profile" @click.stop="openProfile(emp)">View Profile</button>
              </div>
            </div>
          </div>
        </div>

      </div>

    <!-- ADD / EDIT EMPLOYEE MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">{{ editMode ? 'Edit Employee' : 'Add New Employee' }}</h3>
            <p class="modal-sub">{{ editMode ? 'Update employee information' : 'Fill in details to onboard a new employee' }}</p>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- ✅ MILESTONE PROGRESS -->
          <div class="milestone-wrapper">
            <div class="milestone-track-bg"></div>
            <div class="milestone-track-fill" :style="{ width: fillWidth }"></div>
            <div class="milestone-steps">
              <div
                v-for="(ms, i) in milestones"
                :key="i"
                class="ms"
                :class="{ done: i < currentStep, active: i === currentStep }"
              >
                <div class="ms-dot">
                  <svg v-if="i < currentStep" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="ms-label">{{ ms }}</span>
              </div>
            </div>
          </div>

          <!-- STEP 1 -->
          <div v-if="currentStep === 0" class="step-card">
            <div class="step-title">Basic Details</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">First Name *</label>
                <input v-model="form.first_name" class="form-input" placeholder="John" />
                <div v-if="errors.first_name" class="err-msg">Required</div>
              </div>
              <div class="form-field">
                <label class="field-label">Middle Name *</label>
                <input v-model="form.middle_name" class="form-input" placeholder="Optional" />
                  <div v-if="errors.last_name" class="err-msg">Required</div>

              </div>
              <div class="form-field">
                <label class="field-label">Last Name *</label>
                <input v-model="form.last_name" class="form-input" placeholder="Doe" />
                <div v-if="errors.last_name" class="err-msg">Required</div>
              </div>
             
              
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-if="currentStep === 1" class="step-card">
            <div class="step-title">Contact Details</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Personal Email *</label>
                <input v-model="form.personal_email" type="email" class="form-input" placeholder="john.personal@email.com" />
                <div v-if="errors.personal_email" class="err-msg">Valid email required</div>
              </div>
             
              <div class="form-field full-width">
                <label class="field-label">Phone Primary *</label>
                <input v-model="form.phone_primary" class="form-input" placeholder="+91 98XXXXXX" />
                <div v-if="errors.phone_primary" class="err-msg">Required</div>
              </div>
            </div>
          </div>

          <!-- STEP 3 -->
          <div v-if="currentStep === 2" class="step-card">
            <div class="step-title">Employment Details</div>
            <div class="form-grid">
              
              <div class="form-field">
                <label class="field-label">Employeement Type</label>
<select v-model="form.employmentTypeLkpId" class="form-input">
  <option value="">Select</option>
  <option 
    v-for="e in employmentTypeOptions" 
    :key="e.id" 
    :value="e.id"
  >
    {{ e.label }}
  </option>
</select>             

</div>
              <div class="form-field">
                <label class="field-label">Department *</label>
                <select v-model="form.department_id" class="form-input">
                  <option value="">Select</option>
                  <option v-for="d in departmentOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <div v-if="errors.department_id" class="err-msg">Required</div>
              </div>
              <div class="form-field">
                <label class="field-label">Designation *</label>
                <select v-model="form.designation_id" class="form-input">
                  <option value="">Select</option>
                  <option v-for="d in designationOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <div v-if="errors.designation_id" class="err-msg">Required</div>
              </div>
              
              
             
            </div>
          </div>

          <!-- STEP 4 -->
          <div v-if="currentStep === 3" class="step-card">
            <div class="step-title">Dates & Reporting</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Date of Joining *</label>
                <input v-model="form.date_of_joining" type="date" class="form-input" />
                <div v-if="errors.date_of_joining" class="err-msg">Required</div>
              </div>
             
            </div>
          </div>

          

          <!-- SUCCESS -->
          <div v-if="currentStep === 5" class="success-card">
            <div class="success-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16" fill="#2e7d32" />
                <path d="M10 18.5l6 6 10-10" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3>Employee Added Successfully</h3>
            <p>You can view the employee in the listing now.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-outline-dark" @click="closeModal">Cancel</button>

          <div v-if="currentStep !== 5" class="modal-step-actions">
            <button v-if="currentStep > 0" class="btn-outline-green" @click="prevStep">
              &#8592; Previous
            </button>
            <button v-if="currentStep < 4" class="btn-primary" @click="nextStep">
              Next &#8594;
            </button>
            <button v-else class="btn-primary" @click="saveEmployee">
              Add Employee
            </button>
          </div>

          <button v-else class="btn-primary" @click="closeModal">Done</button>
        </div>
      </div>
    </div>

    <!-- EMPLOYEE PROFILE DRAWER -->
    <div v-if="showProfile" class="drawer-overlay" @click.self="closeProfile">
      <div class="profile-drawer">
        <div class="drawer-header">
          <h3 class="drawer-title">Employee Profile</h3>
          <button class="modal-close" @click="closeProfile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="profile-content" v-if="selectedEmp">
          <!-- Profile Hero -->
          <div class="profile-hero">
            <div class="profile-avatar-lg" :style="{ background: selectedEmp.color }">{{ selectedEmp.initials }}</div>
            <div class="profile-hero-info">
              <h2 class="profile-name">{{ selectedEmp.name }}</h2>
              <p class="profile-role">{{ selectedEmp.role }}</p>
              <div class="profile-tags">
                <span class="dept-tag" :style="{ color: selectedEmp.deptColor, background: selectedEmp.deptBg }">{{ selectedEmp.dept }}</span>
                <span :class="['status-badge', selectedEmp.status === 'Active' ? 'active' : 'inactive']">{{ selectedEmp.status }}</span>
              </div>
            </div>
            <!-- <button class="edit-profile-btn" @click="openEdit(selectedEmp); closeProfile()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button> -->
          </div>

          <!-- Profile Tabs -->
          <div class="profile-tabs">
            <button v-for="tab in profileTabs" :key="tab"
              :class="['profile-tab', profileTab === tab && 'active']"
              @click="profileTab = tab">{{ tab }}</button>
          </div>

          <!-- Tab: Info -->
          <div v-if="profileTab === 'Info'" class="profile-section">
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Employee Code</span>
                <span class="info-value">{{ selectedEmp.employee_code || selectedEmp.empId }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">First Name</span>
                <span class="info-value">{{ selectedEmp.firstname || selectedEmp.firstName || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Middle Name</span>
                <span class="info-value">{{ selectedEmp.middle_name || selectedEmp.middleName || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Last Name</span>
                <span class="info-value">{{ selectedEmp.last_name || selectedEmp.lastName || '—' }}</span>
              </div>
             
              

              <div class="info-row">
                <span class="info-label">Personal Email</span>
                <span class="info-value">{{ selectedEmp.work_email || selectedEmp.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Work Email</span>
                <span class="info-value">{{ selectedEmp.work_email || selectedEmp.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone Primary</span>
                <span class="info-value">{{ selectedEmp.phone_primary || selectedEmp.phone || '—' }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Department</span>
                <span class="info-value">{{ selectedEmp.department_name || selectedEmp.dept || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Designation</span>
                <span class="info-value">{{ selectedEmp.designation_name || selectedEmp.role || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Employment Type</span>
  <span class="info-value">{{ selectedEmp.employmentType_name || '—' }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Date of Joining</span>
                <span class="info-value">{{ selectedEmp.date_of_joining || selectedEmp.joinDate || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">{{ selectedEmp.date_of_birth || selectedEmp.dob || '—' }}</span>
              </div>
             
             

              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value">{{ selectedEmp.is_active === false ? 'Inactive' : (selectedEmp.status || 'Active') }}</span>
              </div>

             

              <div class="info-row full">
                <span class="info-label">Address</span>
                <span class="info-value">{{ selectedEmp.address || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Tab: Documents -->
          <div v-if="profileTab === 'Documents'" class="profile-section">
            <div class="doc-form-card">
              <h4 class="doc-form-title">Add Employee Document</h4>
              <div class="doc-form-grid">
                <div class="form-field">
                  <label class="field-label">Document Type</label>
                  <select v-model="docForm.doc_type" class="form-input">
                    <option value="">Select Type</option>
                    <option v-for="t in docTypeOptions" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">File Name</label>
                  <input v-model="docForm.file_name" class="form-input" placeholder="Aadhar Card.pdf" />
                </div>
                <div class="form-field full-width">
                  <label class="field-label">Document URL</label>
                  <div class="url-input-wrap">
                    <input v-model="docForm.file_url" class="form-input" placeholder="https://..." />
                    <button
                      type="button"
                      class="url-preview-btn"
                      :disabled="!docForm.file_url"
                      title="Preview Document URL"
                      @click="showDocUrlPreview = !showDocUrlPreview"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  <div v-if="docForm.file_url && !isValidHttpUrl(docForm.file_url)" class="err-msg">Please enter a valid http/https URL</div>
                </div>
                <div class="form-field">
                  <label class="field-label">Expiry Date</label>
                  <input v-model="docForm.expiry_date" type="date" class="form-input" />
                </div>
                <div class="form-field">
                  <label class="field-label">Confidential</label>
                  <select v-model="docForm.is_confidential" class="form-input">
                    <option :value="false">No</option>
                    <option :value="true">Yes</option>
                  </select>
                </div>
                <div class="form-field full-width">
                  <label class="field-label">Description</label>
                  <textarea v-model="docForm.description" class="form-input textarea" placeholder="Add note for this document"></textarea>
                </div>
              </div>
              <div v-if="showDocUrlPreview && docForm.file_url" class="doc-inline-preview">
                <img
                  v-if="isImageUrl(docForm.file_url)"
                  :src="docForm.file_url"
                  alt="Document image preview"
                  class="doc-preview-image"
                />
                <iframe
                  v-else-if="isPdfUrl(docForm.file_url)"
                  :src="docForm.file_url"
                  class="doc-preview-frame"
                  title="Document pdf preview"
                ></iframe>
                <a v-else :href="docForm.file_url" target="_blank" rel="noopener noreferrer" class="doc-link">Open document URL</a>
              </div>
              <div class="doc-form-actions">
                <button class="btn-primary" @click="addEmployeeDocument">Add Document</button>
              </div>
            </div>

            <div class="doc-list">
              <div v-for="doc in selectedEmployeeDocuments" :key="doc.id" class="doc-item professional">
                <div class="doc-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="doc-info">
                  <p class="doc-name">{{ doc.file_name || doc.doc_type || 'Document' }}</p>
                  <p class="doc-size">
                    <span class="doc-type-badge">{{ getDocTypeLabel(doc) }}</span>
                    {{ doc.doc_type || 'General' }} · {{ doc.date || doc.created_at || '—' }}
                  </p>
                  <p v-if="doc.description" class="doc-desc">{{ doc.description }}</p>
                  <p class="doc-size">
                    Expiry: {{ doc.expiry_date || 'N/A' }}
                    <span v-if="doc.expiry_date" :class="['doc-expiry-chip', getExpiryMeta(doc.expiry_date).className]">{{ getExpiryMeta(doc.expiry_date).label }}</span>
                    · {{ doc.is_confidential ? 'Confidential' : 'Non-Confidential' }}
                  </p>
                </div>
                <div class="doc-actions">
                  <button class="doc-dl-btn" title="Preview" @click="previewDocument(doc)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <a class="doc-dl-btn" :href="doc.file_url" target="_blank" rel="noopener noreferrer" title="Open Link">↗</a>
                  <button class="doc-dl-btn danger" title="Delete" @click="removeDocument(doc.id)">×</button>
                </div>
              </div>
              <div v-if="!selectedEmployeeDocuments.length" class="empty-docs">
                No documents added yet.
              </div>
              <div v-if="activeDocPreview" class="doc-inline-preview">
                <img
                  v-if="isImageUrl(activeDocPreview.file_url)"
                  :src="activeDocPreview.file_url"
                  alt="Document preview"
                  class="doc-preview-image"
                />
                <iframe
                  v-else-if="isPdfUrl(activeDocPreview.file_url)"
                  :src="activeDocPreview.file_url"
                  class="doc-preview-frame"
                  title="Document preview"
                ></iframe>
                <a v-else :href="activeDocPreview.file_url" target="_blank" rel="noopener noreferrer" class="doc-link">Open document URL</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef5350" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h3 class="confirm-title">Remove Employee</h3>
        <p class="confirm-text">Are you sure you want to remove <strong>{{ deleteTarget?.name }}</strong>? This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn-outline-dark" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger" @click="doDelete">Remove</button>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'

export default {
  name: 'EmployeesPage',
  components: { AdminLayout },

  data() {
    return {
      viewMode: 'table',
      showModal: false,
      showProfile: false,
      showDeleteModal: false,
      filterDept:'',
      filterStatus:'',
      searchQuery: '',
      employees: [],
      selectedEmp: null,
      deleteTarget: null,
      currentStep: 0,
      errors: {},


      // ADD THESE:
    profileTab: 'Info',
    profileTabs: ['Info', 'Documents'],
    expandedEmpId: null,
    selectAll: false,
    currentPage: 1,
    totalPages: 1,
    managerOptions: [],
    editMode: false,
    milestones: ['Basic', 'Contact', 'Employment', 'Dates'],
    showUserMenu: false,

    // Profile full detail
    selectedEmpDetail: null,
    profileLoading: false,

    // Documents
    docForm: {
      doc_type: '',
      file_name: '',
      file_url: '',
      expiry_date: '',
      is_confidential: false,
      description: ''
    },
    docTypeOptions: ['Aadhar', 'PAN', 'Passport', 'Offer Letter', 'Other'],
    selectedEmployeeDocuments: [],
    activeDocPreview: null,
    showDocUrlPreview: false,

    // Attendance

      form: {
        first_name: '',
        middle_name: '',
        last_name: '',
        personal_email: '',
        phone_primary: '',
        employmentType_name:'',
         employmentTypeLkpId: '', 
        department_id: '',
        designation_id: '',
        pay_grade_id: '',
        date_of_birth:'',
        date_of_joining: '',
        reporting_manager_id: ''
      },
      

      departmentOptions: [],
      designationOptions: [],
      payGradeOptions: [],
      employmentTypeOptions: []
    }
  },

  mounted() {
    this.loadEmployees()
    this.loadLookups()
  },

  computed: {

  
    totalEmployees() {
      return (this.employees || []).length
    },
    activeEmployeesCount() {
      return (this.employees || []).filter(e => e.status === 'Active').length
    },
    inactiveEmployeesCount() {
      return (this.employees || []).filter(e => e.status !== 'Active').length
    },
    newThisMonthCount() {
      return (this.employees || []).length
    },
    departmentCount() {
      const set = new Set((this.employees || []).map(e => e.dept))
      return set.size
    },
   filteredEmployees() {
  let list = this.employees || []

  if (this.filterDept) {
    list = list.filter(e => e.dept === this.filterDept)
  }

  if (this.filterStatus) {
    list = list.filter(e => e.status === this.filterStatus)
  }
  if (this.searchQuery && this.searchQuery.trim()) {
    const q = this.searchQuery.trim().toLowerCase()
    list = list.filter(e =>
      (e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.empId || '').toLowerCase().includes(q) ||
      (e.dept || '').toLowerCase().includes(q) ||
      (e.role || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q)
    )
  }

  return list
},
  },

  methods: {
    getToken() {
      return sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')
    },

    // ======================
    // LOAD EMPLOYEES
    // ======================
    async loadEmployees() {
  try {
    const token = this.getToken()

    const res = await fetch("http://localhost:3000/api/users/employees", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    console.log("API RESPONSE:", data)

    // ✅ FIX HERE
    const empList = data.employees || []

    this.employees = empList.map(emp => ({
      id: emp.id,

       // ADD THESE THREE:
  firstName: emp.firstName || '',
  middleName: emp.middleName || emp.middlename || '',
  lastName: emp.lastName || '',

      name: `${emp.firstName || ''} ${emp.lastName || ''}`,
      email: emp.workEmail || "—",
      phone: emp.phonePrimary || emp.phone_primary || emp.phone || "—",
      empId: emp.employeeCode || "—",

      dept: emp.department?.name || "—",
      role: emp.designation?.name || emp.user?.role?.name || "—",

       // ✅ Use label for display, code available if you need logic
  employmentType_name: emp.employmentType?.label || '—',
  employmentType_code: emp.employmentType?.code  || '—',
      
      joinDate: emp.createdAt
        ? new Date(emp.createdAt).toLocaleDateString()
        : "—",

      status: emp.isActive ? "Active" : "Inactive",

      initials: `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`,

      color: "#2e7d32",
      deptColor: "#2e7d32",
      deptBg: "#e8f5e9"
    }))

  } catch (err) {
    console.error("Load employees error:", err)
  }
},

toggleGridDetails(emp) {
  this.expandedEmpId = this.expandedEmpId === emp.id ? null : emp.id
},

addEmployeeDocument() {
  if (!this.docForm.doc_type || !this.docForm.file_name) return
  this.selectedEmployeeDocuments.push({
    id: Date.now(),
    ...this.docForm,
    created_at: new Date().toLocaleDateString()
  })
  this.docForm = { doc_type: '', file_name: '', file_url: '', expiry_date: '', is_confidential: false, description: '' }
},

removeDocument(id) {
  this.selectedEmployeeDocuments = this.selectedEmployeeDocuments.filter(d => d.id !== id)
},

previewDocument(doc) {
  this.activeDocPreview = this.activeDocPreview?.id === doc.id ? null : doc
},

isValidHttpUrl(str) {
  try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:' }
  catch { return false }
},

isImageUrl(url) { return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) },
isPdfUrl(url)   { return /\.pdf(\?.*)?$/i.test(url) },

getDocTypeLabel(doc) { return doc.doc_type || 'DOC' },

getExpiryMeta(dateStr) {
  if (!dateStr) return { label: '—', className: 'neutral' }
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (diff < 0)   return { label: 'Expired',    className: 'expired' }
  if (diff < 30)  return { label: 'Expiring Soon', className: 'soon' }
  return { label: 'Valid', className: 'valid' }
},

fillWidth() { /* computed below */
 const total = this.milestones.length
    if (this.currentStep === 0) return '0%'
    return `${(this.currentStep / (total - 1)) * 100}%`


 }
,

    // ======================
    // LOAD LOOKUPS
    // ======================
    async loadLookups() {
  try {
    const token = this.getToken()
    if (!token) {
      console.error("❌ No token found. Login again.")
      return
    }

    const headers = {
      Authorization: `Bearer ${token}`
    }

    const [deptRes, desigRes, payRes, empTypeRes] = await Promise.all([
      fetch("http://localhost:3000/api/lookups/org/departments", { headers }),
      fetch("http://localhost:3000/api/lookups/org/designations", { headers }),
      fetch("http://localhost:3000/api/lookups/org/pay-grades", { headers }),
      fetch("http://localhost:3000/api/lookups/EMP_TYPE", { headers }) // ← add your actual endpoint

    ])
    // 🔥 DEBUG
    console.log("Dept status:", deptRes.status)

    if (deptRes.status === 401 || deptRes.status === 403) {
      console.error("❌ Unauthorized → Token invalid or not admin")
      return
    }

    const deptData = await deptRes.json()
    const desigData = await desigRes.json()
    const payData = await payRes.json()
    const empTypeData = await empTypeRes.json()


    console.log("Dept data:", deptData)

    this.departmentOptions = deptData || []
    this.designationOptions = desigData || []
    this.payGradeOptions = payData || []

this.employmentTypeOptions = empTypeData.values || []

console.log('Employment types loaded:', this.employmentTypeOptions)
  } catch (err) {
    console.error("Lookup error:", err)
  }
},

confirmDelete(emp) {
  this.deleteTarget = emp
  this.showDeleteModal = true
},

async doDelete() {
  try {
    const token = this.getToken()
    const res = await fetch(`http://localhost:3000/api/users/employees/${this.deleteTarget.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to delete employee')
      return
    }

    this.showDeleteModal = false
    this.deleteTarget = null
    this.loadEmployees()  // refresh list

  } catch (err) {
    console.error(err)
    alert('Server error while deleting')
  }
},

    // ======================
    // CREATE EMPLOYEE
    // ======================
    async saveEmployee() {
      if (!this.validateStep(3)) return

      try {
        const token = this.getToken()

        const payload = {
          firstName: this.form.first_name,
          middlename: this.form.middle_name,
          lastName: this.form.last_name,

          email: this.form.personal_email,
          phone: this.form.phone_primary,
            employmentTypeLkpId: this.form.employmentTypeLkpId 
    ? Number(this.form.employmentTypeLkpId)
    : null,   // ✅ ADD THIS
          dateOfJoining: this.form.date_of_joining,
          dateOfBirth:   this.form.date_of_birth || null,         // ✅ ADD

          departmentId: Number(this.form.department_id),
          designationId: Number(this.form.designation_id),
          payGradeId: Number(this.form.pay_grade_id),

          reportingManagerId: this.form.reporting_manager_id
            ? Number(this.form.reporting_manager_id)
            : null
        }

        const res = await fetch("http://localhost:3000/api/users/create-employee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        const data = await res.json()

        if (!res.ok) {
          alert(data.error || "Failed to create employee")
          return
        }

        // SUCCESS
        this.currentStep = 5
        this.loadEmployees()

      } catch (err) {
        console.error(err)
        alert("Server error")
      }
    },

    // ======================
    // VALIDATION
    // ======================
    validateStep(step) {
      const p = this.form
      this.errors = {}

      const req = (k, v) => { if (!v) this.errors[k] = true }

      if (step === 0) {
        req('first_name', p.first_name)
        req('last_name', p.last_name)
      }

      if (step === 1) {
        req('personal_email', p.personal_email)
        req('phone_primary', p.phone_primary)
      }

      if (step === 2) {
      
        req('department_id', p.department_id)
        req('designation_id', p.designation_id)
      }

      if (step === 3) {
        req('date_of_joining', p.date_of_joining)
      }

      return Object.keys(this.errors).length === 0
    },

    nextStep() {
      if (!this.validateStep(this.currentStep)) return
      this.currentStep++
    },

    prevStep() {
      this.currentStep--
    },

    openAddModal() {
      this.resetForm()
      this.currentStep = 0
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    resetForm() {
      this.form = {
        first_name: '',
        middle_name: '',
        last_name: '',
        personal_email: '',
        phone_primary: '',
        department_id: '',
        employmentTypeLkpId: '',
        designation_id: '',
        pay_grade_id: '',
        date_of_joining: '',
        reporting_manager_id: ''
      }
    },

    async openProfile(emp) {
  this.selectedEmp = emp
  this.profileTab = 'Info'
  this.showProfile = true
  this.selectedEmpDetail = null
  this.profileLoading = true

  try {
    const token = this.getToken()
    const res = await fetch(
      `http://localhost:3000/api/employees/${emp.empId}/personal`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    console.log('Employee detail:', data)

    const e = data.employee

    // Merge full detail into selectedEmp so template fields show up
    this.selectedEmp = {
      ...this.selectedEmp,

      employmentType_name: emp.employmentType_name || '—',


      // Personal
      date_of_birth: e.personalDetail?.dateOfBirth
                   ? new Date(e.personalDetail.dateOfBirth).toLocaleDateString()
                   : '—',
      nationality:      e.personalDetail?.nationality || '—',
      marital_status:   e.personalDetail?.maritalStatus?.label || '—',
      blood_group:      e.personalDetail?.bloodGroup?.label || '—',
      emergency_name:   e.personalDetail?.emergencyContactName || '—',
      emergency_phone:  e.personalDetail?.emergencyContactPhone || '—',
      emergency_rel:    e.personalDetail?.emergencyRelation || '—',

      // Address
      address: e.addresses?.[0]
        ? [
            e.addresses[0].line1,
            e.addresses[0].line2,
            e.addresses[0].city?.name,
            e.addresses[0].state?.name,
            e.addresses[0].pincode,
            e.addresses[0].countryCode
          ].filter(Boolean).join(', ')
        : '—',

      // Identity
      identity_type:   e.identities?.[0]?.identityType?.label || '—',
      identity_number: e.identities?.[0]?.identityNumber || '—',
      identity_expiry: e.identities?.[0]?.expiryDate
                         ? new Date(e.identities[0].expiryDate).toLocaleDateString()
                         : '—',
      identity_verified: e.identities?.[0]?.isVerified ? 'Yes' : 'No',
    }

  } catch (err) {
    console.error('Failed to load employee detail:', err)
  } finally {
    this.profileLoading = false
  }
},

    closeProfile() {
      this.showProfile = false
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-page { display: flex; min-height: 100vh; background: #f0f7f0; font-family: 'DM Sans', sans-serif; }

/* ─── SIDEBAR (same as Dashboard) ─────────────────────── */
.sidebar { width: 248px; background: #1a2e1a; display: flex; flex-direction: column; transition: width 0.28s cubic-bezier(.4,0,.2,1); position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow: hidden; }
.sidebar.collapsed { width: 64px; }
.sidebar.mobile-open { z-index: 300; }
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: -1;
}
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.sidebar-logo { display: flex; align-items: center; gap: 10px; }
.sidebar-logo-icon { width: 34px; height: 34px; background: #2e7d32; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sidebar-logo-text { font-size: 15px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; }
.collapse-btn { background: none; border: none; color: #7a9a7a; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; flex-shrink: 0; transition: color 0.2s; }
.collapse-btn:hover { color: #fff; }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.nav-section-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; color: #4a6a4a; padding: 12px 8px 4px; white-space: nowrap; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 10px; border-radius: 10px; color: #8aaa8a; font-size: 13.5px; font-weight: 500; text-decoration: none; cursor: pointer; transition: background 0.18s, color 0.18s; white-space: nowrap; }
.nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.nav-item.active { background: #2e7d32; color: #fff; }
.nav-item svg { flex-shrink: 0; }
.nav-badge { margin-left: auto; background: #4caf50; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; line-height: 1.4; }
.nav-badge.warn { background: #ef6c00; }
.sidebar-user { display: flex; align-items: center; gap: 10px; padding: 16px 14px; border-top: 1px solid rgba(255,255,255,0.06); }
.sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: #2e7d32; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.sidebar-user-info { flex: 1; overflow: hidden; }
.sidebar-user-name { font-size: 13px; font-weight: 600; color: #e0ede0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: 11px; color: #6a8a6a; }
.logout-btn { background: none; border: none; color: #6a8a6a; cursor: pointer; padding: 4px; flex-shrink: 0; transition: color 0.2s; display: flex; }
.logout-btn:hover { color: #ef5350; }

/* ─── MAIN ─────────────────────────── */
.main-content { flex: 1; margin-left: 248px; display: flex; flex-direction: column; }

/* ─── TOPBAR ─────────────────────────── */
.topbar { height: 64px; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; border-bottom: 1px solid #e8f0e8; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.page-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a2e1a; font-weight: 400; }
.breadcrumb { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #8aaa8a; }
.bc-active { color: #2e7d32; font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: 14px; }
.search-bar { display: flex; align-items: center; gap: 8px; background: #f4faf4; border: 1.5px solid #dce8dc; border-radius: 10px; padding: 8px 14px; }
.search-bar input { background: none; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1a2e1a; width: 240px; }
.search-bar input::placeholder { color: #b0c8b0; }
.search-bar svg { color: #8aaa8a; }
.topbar-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #2e7d32, #43a047); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; }

/* ─── CONTENT BODY ─────────────────────────── */
.content-body {display: flex; flex-direction: column;   overflow-y: auto;
  height: calc(100vh - 120px); }
.emp-hero-date { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; letter-spacing: 0.04em; }
.emp-hero-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; margin-bottom: 6px; }
.emp-hero-sub { font-size: 13.5px; color: rgba(255,255,255,0.72); }

.emp-top-box {
  background: #fff;
  border: 1px solid #e8f0e8;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
}

/* ─── EMP STATS ROW ─────────────────────────── */
.emp-stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.emp-stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #e8f0e8; }
.es-label { font-size: 11.5px; color: #8aaa8a; font-weight: 500; margin-bottom: 6px; }
.es-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a2e1a; }
.es-value.green { color: #2e7d32; }
.es-value.red { color: #c62828; }
.es-value.blue { color: #1565c0; }
.es-value.purple { color: #6a1b9a; }

/* ─── TOOLBAR ─────────────────────────── */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }
.view-toggle { display: flex; background: #fff; border: 1.5px solid #dce8dc; border-radius: 10px; overflow: hidden; margin:11px }
.view-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #8aaa8a; cursor: pointer; transition: all 0.2s; }
.view-btn.active { background: #2e7d32; color: #fff; }
.filter-select { height: 38px; padding: 0 12px; background: #fff; border: 1.5px solid #dce8dc; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #4a6a4a; outline: none; cursor: pointer; }
.btn-primary { display: flex; align-items: center; gap: 7px; height: 38px; padding: 0 18px; background: linear-gradient(135deg, #2e7d32, #43a047); color: white; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.btn-primary:hover { opacity: 0.9; }
.btn-outline-green { display: flex; align-items: center; gap: 7px; height: 38px; padding: 0 18px; background: #fff; color: #2e7d32; border: 1.5px solid #b8d9b8; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-outline-green:hover { background: #f0f7f0; }

/* ─── CARD ─────────────────────────── */
.card { background: #fff; border-radius: 18px; border: 1px solid #e8f0e8; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

/* ─── TABLE ─────────────────────────── */
.table-wrapper { overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { background: #f8fcf8; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #6a8a6a; letter-spacing: 0.06em; border-bottom: 1px solid #edf4ed; white-space: nowrap; }
.data-table th:first-child { padding-left: 22px; }
.data-table th:last-child { padding-right: 22px; }
.data-table tbody tr { border-bottom: 1px solid #f4faf4; transition: background 0.15s; }
.data-table tbody tr:hover { background: #fafcfa; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table td { padding: 12px 14px; vertical-align: middle; }
.data-table td:first-child { padding-left: 22px; }
.data-table td:last-child { padding-right: 22px; }
.details-row td { padding: 0 22px 14px; background: #fafcfa; }
.details-card { border: 1px solid #e8f0e8; background: #fff; border-radius: 14px; padding: 14px; }
.details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 12px; }
.details-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border: 1px solid #f0f7f0; background: #fafcfa; border-radius: 12px; }
.details-k { font-size: 10px; font-weight: 800; color: #8aaa8a; letter-spacing: 0.06em; text-transform: uppercase; }
.details-v { font-size: 12.5px; color: #1a2e1a; }
.cb { cursor: pointer; accent-color: #2e7d32; width: 15px; height: 15px; }
.emp-cell { display: flex; align-items: center; gap: 10px; }
.emp-avatar { width: 36px; height: 36px; border-radius: 50%; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.emp-name { font-size: 13.5px; font-weight: 600; color: #1a2e1a; }
.emp-email { font-size: 11px; color: #8aaa8a; }
.id-cell { font-size: 12px; color: #8aaa8a; font-family: monospace; }
.dept-tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.role-cell { font-size: 13px; color: #4a6a4a; white-space: nowrap; }
.date-cell, .phone-cell { font-size: 12.5px; color: #6a8a6a; white-space: nowrap; }
.status-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.inactive { background: #fbe9e7; color: #bf360c; }
.action-btns { display: flex; gap: 6px; }
.action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; }
.action-btn.view { background: #e8f5e9; color: #2e7d32; }
.action-btn.edit { background: #e3f2fd; color: #1565c0; }
.action-btn.delete { background: #fbe9e7; color: #c62828; }
.action-btn:hover { opacity: 0.75; }

/* ─── PAGINATION ─────────────────────────── */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #f0f7f0; }
.page-info { font-size: 12px; color: #8aaa8a; }
.page-btns { display: flex; gap: 4px; }
.page-btn { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #dce8dc; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #4a6a4a; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.page-btn.active { background: #2e7d32; color: #fff; border-color: #2e7d32; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ─── GRID VIEW ─────────────────────────── */
.emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.emp-card { background: #fff; border-radius: 18px; border: 1px solid #e8f0e8; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.emp-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.emp-card-header { padding: 28px 20px 16px; display: flex; align-items: flex-start; justify-content: space-between; }
.emp-card-avatar { width: 54px; height: 54px; border-radius: 50%; color: #fff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.status-badge-sm { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
.status-badge-sm.active { background: #e8f5e9; color: #2e7d32; }
.status-badge-sm.inactive { background: #fbe9e7; color: #bf360c; }
.emp-card-body { padding: 0 20px 18px; }
.emp-card-name { font-size: 15px; font-weight: 700; color: #1a2e1a; margin-bottom: 2px; }
.emp-card-role { font-size: 12.5px; color: #6a8a6a; margin-bottom: 10px; }
.emp-card-meta { margin: 12px 0; display: flex; flex-direction: column; gap: 5px; }
.emp-meta-row { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #8aaa8a; }
.emp-card-actions { display: flex; gap: 8px; margin-top: 14px; }
.card-action-btn { flex: 1; height: 34px; border-radius: 8px; border: 1.5px solid #dce8dc; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #4a6a4a; cursor: pointer; transition: all 0.2s; }
.card-action-btn.view-profile { background: #2e7d32; color: #fff; border-color: #2e7d32; }
.card-action-btn:hover { opacity: 0.85; }

.emp-card-details {
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #e8f0e8;
  background: #fafcfa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emp-detail-row { display: flex; justify-content: space-between; gap: 10px; }
.emp-detail-k { font-size: 11px; font-weight: 800; color: #8aaa8a; letter-spacing: 0.06em; text-transform: uppercase; }
.emp-detail-v { font-size: 12.5px; color: #1a2e1a; text-align: right; }

/* ─── MODAL ─────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-box { background: #fff; border-radius: 24px; width: 90%; max-width: 660px; max-height: 88vh; overflow-y: auto; display: flex; flex-direction: column; }
.modal-box::-webkit-scrollbar { width: 4px; }
.modal-box::-webkit-scrollbar-thumb { background: #dce8dc; border-radius: 2px; }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 28px 32px 0; }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a2e1a; font-weight: 400; }
.modal-sub { font-size: 13px; color: #8aaa8a; margin-top: 2px; }
.modal-close { background: #f0f7f0; border: none; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4a6a4a; transition: background 0.2s; }
.modal-close:hover { background: #e0ede0; }
.modal-body { padding: 24px 32px; flex: 1; }
.avatar-upload-row { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; padding: 16px; background: #f8fcf8; border-radius: 14px; border: 1.5px dashed #c5d9c3; }
.avatar-preview { width: 56px; height: 56px; border-radius: 50%; color: #fff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-label { font-size: 13.5px; font-weight: 600; color: #1a2e1a; margin-bottom: 2px; }
.avatar-hint { font-size: 11px; color: #8aaa8a; margin-bottom: 8px; }
.avatar-preview-img-wrap { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.upload-btn { height: 30px; padding: 0 14px; background: #fff; border: 1.5px solid #c5d9c3; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #2e7d32; cursor: pointer; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #4a6a4a; }
.form-input { height: 44px; border: 1.5px solid #dce8dc; border-radius: 10px; padding: 0 14px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1a2e1a; background: #fafcfa; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.form-input::placeholder { color: #b0c8b0; }
.form-input:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,0.1); background: #fff; }
.form-input.textarea { height: 80px; padding: 10px 14px; resize: vertical; }
.modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 18px 32px 24px; border-top: 1px solid #f0f7f0; }
.modal-step-actions { display: flex; align-items: center; gap: 10px; }
.btn-outline-dark { height: 42px; padding: 0 20px; background: #fff; color: #4a6a4a; border: 1.5px solid #dce8dc; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-outline-dark:hover { background: #f4faf4; }

/* ─── MILESTONE WIZARD ───────────────────────────────────────────── */
.milestone-wrapper {
  position: relative;
  margin-bottom: 18px;
  padding-top: 6px;
}

.milestone-track-bg {
  position: absolute;
  top: 26px;
  left: 0;
  right: 0;
  height: 3px;
  background: #e2eee5;
  border-radius: 2px;
  z-index: 0;
}

.milestone-track-fill {
  position: absolute;
  top: 26px;
  left: 0;
  height: 3px;
  background: #2e7d32;
  border-radius: 2px;
  z-index: 1;
  transition: width 0.45s ease;
}

.milestone-steps {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.milestone-steps .ms {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 64px;
}

.ms-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid #d8e8da;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #9cb8a0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.ms.active .ms-dot {
  background: #e8f5e9;
  border-color: #2e7d32;
  color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.12);
}

.ms.done .ms-dot {
  background: #2e7d32;
  border-color: #2e7d32;
  color: #fff;
}

.ms-label {
  font-size: 10.5px;
  color: #9cb8a0;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-align: center;
  line-height: 1.1;
}

.ms.active .ms-label { color: #2e7d32; }
.ms.done .ms-label { color: #2e7d32; }

/* ─── Step Content ─────────────────────────────────────────────── */
.step-card {
  background: #f8fcf8;
  border: 1.5px solid #e8f0e8;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 6px;
}

.step-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #1a2e1a;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f7f0;
}

.err-msg { font-size: 11px; color: #e53935; margin-top: 3px; font-weight: 600; }

/* ─── Success ───────────────────────────────────────────────────── */
.success-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
  padding: 44px 28px;
  text-align: center;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.success-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1a2e1a;
  margin-bottom: 6px;
}

.success-card p {
  font-size: 13.5px;
  color: #6a8a6a;
}

/* ─── DRAWER ─────────────────────────── */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; justify-content: flex-end; }
.profile-drawer { width: 440px; background: #fff; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.profile-drawer::-webkit-scrollbar { width: 4px; }
.profile-drawer::-webkit-scrollbar-thumb { background: #dce8dc; border-radius: 2px; }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; border-bottom: 1px solid #f0f7f0; position: sticky; top: 0; background: #fff; z-index: 10; }
.drawer-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: #1a2e1a; font-weight: 400; }
.profile-content { flex: 1; }
.profile-hero { display: flex; align-items: flex-start; gap: 16px; padding: 24px; background: linear-gradient(135deg, #1a2e1a, #2e7d32); position: relative; }
.profile-avatar-lg { width: 64px; height: 64px; border-radius: 50%; color: #fff; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 3px solid rgba(255,255,255,0.3); }
.profile-hero-info { flex: 1; }
.profile-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: #fff; font-weight: 400; margin-bottom: 2px; }
.profile-role { font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 10px; }
.profile-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.edit-profile-btn { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.profile-tabs { display: flex; border-bottom: 1px solid #f0f7f0; padding: 0 24px; }
.profile-tab { padding: 14px 0; margin-right: 28px; font-size: 13.5px; font-weight: 600; color: #8aaa8a; border: none; background: none; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all 0.2s; }
.profile-tab.active { color: #2e7d32; border-bottom-color: #2e7d32; }
.profile-section { padding: 20px 24px; }
.info-row { display: flex; padding: 12px 16px; background: #fff; gap: 20px; }
.info-row:last-child {}
.info-label { font-size: 11.5px; font-weight: 700; color: #8aaa8a; min-width: 110px; letter-spacing: 0.04em; }
.info-value { font-size: 13.5px; color: #1a2e1a; }
.att-mini-card { border-radius: 12px; padding: 14px 16px; }
.att-mini-card.green { background: #e8f5e9; }
.att-mini-card.red { background: #fbe9e7; }
.att-mini-card.orange { background: #fff3e0; }
.amc-label { font-size: 11px; color: #6a8a6a; font-weight: 600; margin-bottom: 4px; }
.amc-value { font-family: 'DM Serif Display', serif; font-size: 26px; color: #1a2e1a; }
.att-log-list { border-radius: 12px; overflow: hidden; border: 1px solid #f0f7f0; }
.att-log-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; font-size: 12.5px; border-bottom: 1px solid #f0f7f0; }
.att-log-row:last-child { border-bottom: none; }
.att-log-date { color: #4a6a4a; font-weight: 600; width: 50px; }
.att-log-in, .att-log-out { color: #6a8a6a; width: 70px; }
.att-log-status { font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; }
.att-log-status.present { background: #e8f5e9; color: #2e7d32; }
.att-log-status.absent { background: #fbe9e7; color: #c62828; }
.att-log-status.late { background: #fff3e0; color: #e65100; }
.doc-form-card { border: 1px solid #e8f0e8; border-radius: 12px; padding: 14px; background: #f8fcf8; margin-bottom: 14px; }
.doc-form-title { font-size: 14px; font-weight: 700; color: #1a2e1a; margin-bottom: 12px; }
.doc-form-actions { margin-top: 12px; display: flex; justify-content: flex-end; }
.doc-list { display: flex; flex-direction: column; gap: 8px; }
.doc-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8fcf8; border-radius: 10px; }
.doc-item.professional { border: 1px solid #e8f0e8; background: #fff; }
.doc-icon { flex-shrink: 0; }
.doc-info { flex: 1; }
.doc-name { font-size: 13px; font-weight: 600; color: #1a2e1a; }
.doc-size { font-size: 11px; color: #8aaa8a; }
.doc-desc { font-size: 11.5px; color: #4a6a4a; margin-top: 2px; }
.doc-type-badge { display: inline-flex; align-items: center; justify-content: center; height: 18px; padding: 0 6px; border-radius: 20px; background: #e8f5e9; color: #2e7d32; font-size: 10px; font-weight: 800; letter-spacing: 0.03em; margin-right: 6px; }
.doc-expiry-chip { display: inline-flex; align-items: center; height: 18px; padding: 0 7px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-left: 6px; }
.doc-expiry-chip.valid { background: #e8f5e9; color: #2e7d32; }
.doc-expiry-chip.soon { background: #fff3e0; color: #e65100; }
.doc-expiry-chip.expired { background: #fbe9e7; color: #c62828; }
.doc-expiry-chip.neutral { background: #f0f7f0; color: #6a8a6a; }
.doc-actions { display: flex; gap: 6px; }
.doc-dl-btn { width: 30px; height: 30px; border-radius: 8px; background: #e8f5e9; border: none; color: #2e7d32; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; }
.doc-dl-btn.danger { background: #fbe9e7; color: #c62828; }
.doc-inline-preview { margin-top: 10px; border: 1px solid #e8f0e8; border-radius: 10px; overflow: hidden; background: #fff; padding: 8px; }
.doc-preview-image { width: 100%; max-height: 240px; object-fit: contain; border-radius: 8px; display: block; background: #f8fcf8; }
.doc-preview-frame { width: 100%; height: 260px; border: none; border-radius: 8px; background: #fff; }
.doc-link { color: #2e7d32; font-size: 12.5px; font-weight: 600; text-decoration: none; }
.doc-link:hover { text-decoration: underline; }
.empty-docs { font-size: 12px; color: #8aaa8a; padding: 10px 4px; }
.url-input-wrap { position: relative; }
.url-input-wrap .form-input { padding-right: 44px; width: 100%; }
.url-preview-btn { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border: 1.5px solid #dce8dc; background: #fff; color: #2e7d32; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.url-preview-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.photo-url-preview { margin-top: 8px; border: 1px solid #e8f0e8; border-radius: 10px; background: #fff; padding: 8px; }
.photo-url-preview-img { width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px; background: #f8fcf8; display: block; }

/* ─── DELETE CONFIRM ─────────────────────────── */
.confirm-modal { background: #fff; border-radius: 20px; padding: 32px; width: 90%; max-width: 400px; text-align: center; }
.confirm-icon { width: 60px; height: 60px; background: #fbe9e7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.confirm-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a2e1a; margin-bottom: 8px; }
.confirm-text { font-size: 13.5px; color: #6a8a6a; margin-bottom: 24px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger { height: 42px; padding: 0 24px; background: #ef5350; color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-danger:hover { opacity: 0.9; }

/* Responsive Design */


@media (max-width: 768px) {
  .emp-hero { padding: 16px; border-radius: 14px; }
  .emp-hero-title { font-size: 22px; }
  .emp-hero-sub { font-size: 12px; }
  .emp-top-box { padding: 12px; border-radius: 14px; }

  /* SHOW MENU BUTTON */
  .mobile-toggle {
    display: block !important;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 300;
    background: #2e7d32;
    color: white;
    border: none;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
  }

  /* SIDEBAR HIDDEN */
  .sidebar {
    left: -248px;
    transition: left 0.3s ease;
  }

  /* SIDEBAR OPEN */
  .sidebar.mobile-open {
    left: 0;
  }

  /* OVERLAY WHEN SIDEBAR OPEN */
  .sidebar.mobile-open::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: -1;
  }

  /* MAIN CONTENT */
  .main-content {
    margin-left: 0;
  }

  /* TOPBAR */
  .topbar {
    left: 0;
    padding-left: 60px;
  }

  /* Stats cards */
  

  /* Toolbar */
  .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .toolbar-left { flex-wrap: wrap; justify-content: flex-start; gap: 8px; }
  .toolbar-right { justify-content: flex-start; }
  .view-toggle { width: 100%; }
  .view-btn { flex: 1; justify-content: center; }
  .filter-select { flex: 1; min-width: 150px; }
  .btn-outline-green { width: 100%; justify-content: center; }


  

  /* Table responsive */
  .data-table { font-size: 12px; }
  .data-table th, .data-table td { padding: 8px 10px; }
  .emp-cell { gap: 8px; }
  .emp-avatar { width: 32px; height: 32px; font-size: 11px; }
  .emp-name { font-size: 12px; }
  .emp-email { font-size: 10px; }
  .action-btns { gap: 4px; }
  .action-btn { width: 26px; height: 26px; }
  .details-grid { grid-template-columns: 1fr; }

  

  /* Modal */
  .modal-box { width: 95%; max-width: 500px; }
  .modal-header { padding: 20px 24px 0; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px 20px; }

  /* Drawer */
  .profile-drawer { width: 90%; max-width: 380px; }
  .drawer-header { padding: 18px 20px; }
  .profile-hero { padding: 20px; }
  .profile-avatar-lg { width: 56px; height: 56px; font-size: 18px; }
  .profile-name { font-size: 18px; }
  .profile-section { padding: 16px 20px; }
  .profile-tabs { padding: 0 20px; }
  .profile-tab { margin-right: 20px; font-size: 13px; }

  /* Confirm modal */
  .confirm-modal { width: 90%; max-width: 350px; padding: 24px; }
}

@media (max-width: 480px) {
  .emp-hero { padding: 14px; }
  .emp-hero-title { font-size: 20px; }
  .emp-top-box { padding: 10px; }
  .emp-stat-card { padding: 12px 14px; }
  .es-value { font-size: 20px; }

  .toolbar-left,
  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .filter-select,
  .btn-outline-green {
    width: 100%;
    min-width: 0;
  }

  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  /* Table to card layout */
  .data-table { display: block; }
  .data-table thead { display: none; }
  .data-table tbody { display: block; }
  .data-table tr { display: block; border: 1px solid #e8f0e8; border-radius: 12px; margin-bottom: 12px; padding: 12px; background: #fff; }
  .data-table td { display: block; border: none; padding: 5px 0; text-align: left; }
  .data-table td:before {
    content: attr(data-label);
    display: inline-block;
    font-weight: 700;
    color: #6a8a6a;
    font-size: 11px;
    margin-right: 8px;
    min-width: 80px;
  }
  .data-table td:nth-child(1):before { content: "Select"; }
  .data-table td:nth-child(2):before { content: "Employee"; }
  .data-table td:nth-child(3):before { content: "ID"; }
  .data-table td:nth-child(4):before { content: "Department"; }
  .data-table td:nth-child(5):before { content: "Role"; }
  .data-table td:nth-child(6):before { content: "Join Date"; }
  .data-table td:nth-child(7):before { content: "Phone"; }
  .data-table td:nth-child(8):before { content: "Status"; }
  .data-table td:nth-child(9):before { content: "Actions"; }
  .emp-cell { flex-direction: column; align-items: flex-start; gap: 6px; }
  .action-btns { justify-content: center; margin-top: 8px; }

  

  /* Modal */
  .modal-box { width: 95%; max-height: 90vh; }
  .avatar-upload-row { flex-direction: column; text-align: center; gap: 12px; }
  .form-input.textarea { height: 60px; }

  /* Drawer */
  .profile-drawer { width: 95%; }
  .profile-hero { flex-direction: column; text-align: center; gap: 12px; }
  .profile-tags { justify-content: center; }
  
  .info-row { flex-direction: column; gap: 4px; }
  .info-label { min-width: auto; }

  /* Topbar */
  .topbar { padding: 0 16px; }
  .search-bar { width: 100%; max-width: 300px; }
  .search-bar input { width: 100%; }

  /* Content body */
  .content-body { padding: 16px 20px; }
}

.table-scroll {
  overflow-y: auto;
  max-height: 500px;
}

.table-scroll::-webkit-scrollbar {
  width: 6px;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #cfe3cf;
  border-radius: 20px;
}

.data-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8fcf8;
}

.sticky-top-box {
  position: sticky;

  z-index: 50;

  background: #fff;

  padding: 16px;

  border-radius: 18px;

  box-shadow: 0 4px 14px rgba(0,0,0,0.06);

  margin-bottom: 22px;
}
</style>