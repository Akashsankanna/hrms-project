<template>
  <UserLayout page-title="Employee Profile" page-sub="Manage your personal and professional details">
    <div>

      <!-- ✅ MILESTONE PROGRESS BAR -->
      <div v-if="!viewMode" class="milestone-wrapper">
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
                <path d="M2.5 7l3 3 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="ms-label">{{ ms }}</span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- ✅ VIEW MODE — Full Profile Display             -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="viewMode" class="profile-view">

        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="profile-avatar">
            <img v-if="saved.profilePhotoUrl" :src="saved.profilePhotoUrl" alt="Profile" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="15" r="8" fill="#9cb8a0"/>
                <path d="M4 36c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#9cb8a0"/>
              </svg>
            </div>
          </div>
          <div class="profile-header-info">
            <h2 class="profile-name">{{ saved.emergencyName ? 'Employee Profile' : 'Employee Profile' }}</h2>
            <div class="profile-badges">
              <span class="badge" v-if="saved.nationality">{{ saved.nationality }}</span>
              <span class="badge" v-if="saved.blood">{{ saved.blood }}</span>
              <span class="badge" v-if="saved.maritalStatus">{{ saved.maritalStatus }}</span>
            </div>
          </div>
          <button class="btn-edit-top" @click="startEdit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Profile
          </button>
        </div>

        <!-- Section Grid -->
        <div class="view-sections">

          <!-- Personal Details -->
          <div class="view-card">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Details
            </div>
            <div class="view-grid">
              <div class="view-field"><span class="vf-label">Date of Birth</span><span class="vf-val">{{ formatDate(saved.dob) || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Nationality</span><span class="vf-val">{{ saved.nationality || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Blood Group</span><span class="vf-val">{{ saved.blood || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Marital Status</span><span class="vf-val">{{ saved.maritalStatus || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Emergency Contact</span><span class="vf-val">{{ saved.emergencyName || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Emergency Phone</span><span class="vf-val">{{ saved.emergencyPhone || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Emergency Relation</span><span class="vf-val">{{ saved.emergencyRelation || '—' }}</span></div>
            </div>
          </div>

          <!-- Address Details -->
          <div class="view-card">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Address
            </div>
            <div class="view-grid">
              <div class="view-field full"><span class="vf-label">Current Address</span><span class="vf-val">{{ formatAddress('current') }}</span></div>
              <div class="view-field full"><span class="vf-label">Permanent Address</span><span class="vf-val">{{ formatAddress('permanent') }}</span></div>
            </div>
          </div>

          <!-- Education -->
          <div class="view-card">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Education
            </div>
            <div class="view-grid">
              <div class="view-field"><span class="vf-label">Degree</span><span class="vf-val">{{ saved.degree || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Field of Study</span><span class="vf-val">{{ saved.field || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Institution</span><span class="vf-val">{{ saved.institution || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">University</span><span class="vf-val">{{ saved.university || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Year</span><span class="vf-val">{{ saved.startYear && saved.year ? `${saved.startYear} – ${saved.year}` : (saved.year || '—') }}</span></div>
              <div class="view-field"><span class="vf-label">CGPA / %</span><span class="vf-val">{{ saved.cgpa || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Highest Qualification</span><span class="vf-val">{{ saved.highestQualification || '—' }}</span></div>
            </div>
          </div>

          <!-- Employment -->
          <div class="view-card">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              Previous Employment
            </div>
            <div v-if="saved.isFresher" class="fresher-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Fresher — No prior experience
            </div>
            <div v-else class="view-grid">
              <div class="view-field"><span class="vf-label">Company</span><span class="vf-val">{{ saved.company || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Role</span><span class="vf-val">{{ saved.role || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Type</span><span class="vf-val">{{ saved.employmentType || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Duration</span><span class="vf-val">{{ formatDate(saved.start) }} – {{ formatDate(saved.end) }}</span></div>
              <div class="view-field"><span class="vf-label">Last CTC</span><span class="vf-val">{{ saved.lastDrawnCTC ? `${saved.currency || ''} ${saved.lastDrawnCTC}` : '—' }}</span></div>
            </div>
          </div>

          <!-- Identity -->
          <div class="view-card">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 15s0-3 4-3 4 3 4 3"/></svg>
              Identity
            </div>
            <div class="view-grid">
              <div class="view-field"><span class="vf-label">Type</span><span class="vf-val">{{ saved.identityType || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Number</span><span class="vf-val">{{ maskIdentity(saved.identityNumber, saved.identityType) }}</span></div>
              <div class="view-field"><span class="vf-label">Name on Doc</span><span class="vf-val">{{ saved.nameOnDocument || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Expiry</span><span class="vf-val">{{ formatDate(saved.expiryDate) || '—' }}</span></div>
              <div class="view-field"><span class="vf-label">Verified</span>
                <span class="vf-val">
                  <span :class="saved.identityVerified ? 'pill-yes' : 'pill-no'">{{ saved.identityVerified ? 'Yes' : 'No' }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Documents -->
          <div class="view-card full-width">
            <div class="view-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Documents
            </div>
            <div v-if="documents.length === 0" class="empty-docs">No documents uploaded.</div>
            <table v-else class="documents-table">
              <thead>
                <tr>
                  <th>Type</th><th>File Name</th><th>Size (KB)</th><th>Confidential</th><th>Preview</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(doc, i) in documents" :key="i">
                  <td data-label="Type">{{ doc.docType }}</td>
                  <td data-label="File Name">{{ doc.fileName }}</td>
                  <td data-label="Size">{{ doc.fileSizeKb }}</td>
                  <td data-label="Confidential"><span :class="doc.isConfidential ? 'pill-yes' : 'pill-no'">{{ doc.isConfidential ? 'Yes' : 'No' }}</span></td>
                  <td data-label="Preview"><span class="eye-icon" @click="previewDoc(doc.fileUrl)">👁️</span></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- ✅ FORM MODE                                    -->
      <!-- ═══════════════════════════════════════════════ -->

      <!-- STEP 1 — PERSONAL DETAILS -->
      <div v-if="!viewMode && currentStep === 0" class="form-card">
        <div class="card-title">Personal Details</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Date of Birth <span class="req">*</span></label>
            <input type="date" v-model="profile.dob" :class="{ error: errors.dob }" />
            <span class="err-msg" v-if="errors.dob">Date of birth is required</span>
          </div>
          <div class="form-group">
            <label>Nationality <span class="req">*</span></label>
            <input v-model="profile.nationality" :class="{ error: errors.nationality }" placeholder="e.g. Indian" />
            <span class="err-msg" v-if="errors.nationality">Nationality is required</span>
          </div>
          <div class="form-group">
            <label>Blood Group <span class="req">*</span></label>
            <input v-model="profile.blood" :class="{ error: errors.blood }" placeholder="e.g. B+" />
            <span class="err-msg" v-if="errors.blood">Blood group is required</span>
          </div>
          <div class="form-group">
            <label>Marital Status</label>
            <input v-model="profile.maritalStatus" placeholder="Single / Married" />
          </div>
          <div class="form-group">
            <label>Profile Photo URL</label>
            <input v-model="profile.profilePhotoUrl" placeholder="Enter image URL" />
          </div>
          <div class="form-group">
            <label>Emergency Contact Name</label>
            <input v-model="profile.emergencyName" />
          </div>
          <div class="form-group">
            <label>Emergency Contact Relation</label>
            <input v-model="profile.emergencyRelation" />
          </div>
          <div class="form-group">
            <label>Emergency Contact Phone <span class="req">*</span></label>
            <input v-model="profile.emergencyPhone" :class="{ error: errors.emergencyPhone }" maxlength="20" placeholder="+91 XXXXXXXXXX" />
            <span class="err-msg" v-if="errors.emergencyPhone">Emergency contact phone is required</span>
          </div>
        </div>
        <div class="nav-row">
          <div></div>
          <button class="btn-next" @click="handlePersonalNext">Next →</button>
        </div>
      </div>

      <!-- STEP 2 — ADDRESS DETAILS -->
      <div v-if="!viewMode && currentStep === 1" class="form-card">
        <div class="card-title">Address Details</div>
        <div class="sub-card">
          <div class="sub-card-title">Current Address</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Address Type</label>
              <input v-model="profile.addressType" placeholder="Current / Permanent" />
            </div>
            <div class="form-group full">
              <label>Address Line 1 <span class="req">*</span></label>
              <input v-model="profile.address" :class="{ error: errors.address }" placeholder="House / Flat no., Street, Area" />
              <span class="err-msg" v-if="errors.address">Address is required</span>
            </div>
            <div class="form-group full">
              <label>Address Line 2</label>
              <input v-model="profile.address2" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Landmark</label>
              <input v-model="profile.landmark" />
            </div>
            <div class="form-group">
              <label>City <span class="req">*</span></label>
              <input v-model="profile.city" :class="{ error: errors.city }" placeholder="e.g. Nashik" />
              <span class="err-msg" v-if="errors.city">City is required</span>
            </div>
            <div class="form-group">
              <label>State <span class="req">*</span></label>
              <input v-model="profile.state" :class="{ error: errors.state }" placeholder="e.g. Maharashtra" />
              <span class="err-msg" v-if="errors.state">State is required</span>
            </div>
            <div class="form-group">
              <label>Country</label>
              <input v-model="profile.country" placeholder="e.g. India" />
            </div>
            <div class="form-group">
              <label>Pincode <span class="req">*</span></label>
              <input v-model="profile.pincode" :class="{ error: errors.pincode }" placeholder="6-digit pincode" maxlength="6" />
              <span class="err-msg" v-if="errors.pincode">Valid 6-digit pincode is required</span>
            </div>
          </div>
        </div>

        <div class="sub-card" style="margin-top:20px;">
          <div class="perm-header">
            <div class="sub-card-title">Permanent Address</div>
            <label class="checkbox-label">
              <input type="checkbox" v-model="profile.sameAsCurrent" @change="syncPermAddress" />
              <span>Same as Current</span>
            </label>
          </div>
          <div class="form-grid">
            <div class="form-group full">
              <label>Address Line 1 <span class="req">*</span></label>
              <input v-model="profile.permAddress" :disabled="profile.sameAsCurrent" placeholder="House / Flat no., Street, Area" />
            </div>
            <div class="form-group full">
              <label>Address Line 2</label>
              <input v-model="profile.permAddress2" :disabled="profile.sameAsCurrent" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Landmark</label>
              <input v-model="profile.permLandmark" :disabled="profile.sameAsCurrent" />
            </div>
            <div class="form-group">
              <label>City <span class="req">*</span></label>
              <input v-model="profile.permCity" :disabled="profile.sameAsCurrent" />
            </div>
            <div class="form-group">
              <label>State <span class="req">*</span></label>
              <input v-model="profile.permState" :disabled="profile.sameAsCurrent" />
            </div>
            <div class="form-group">
              <label>Country</label>
              <input v-model="profile.permCountry" :disabled="profile.sameAsCurrent" />
            </div>
            <div class="form-group">
              <label>Pincode <span class="req">*</span></label>
              <input v-model="profile.permPincode" :disabled="profile.sameAsCurrent" />
            </div>
          </div>
        </div>

        <div class="nav-row">
          <button class="btn-prev" @click="prev">← Back</button>
          <button class="btn-next" @click="handleAddressNext">Next →</button>
        </div>
      </div>

      <!-- STEP 3 — EDUCATION -->
      <div v-if="!viewMode && currentStep === 2" class="form-card">
        <div class="card-title">Education</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Degree <span class="req">*</span></label>
            <input v-model="profile.degree" :class="{ error: errors.degree }" placeholder="e.g. B.Tech" />
            <span class="err-msg" v-if="errors.degree">Degree is required</span>
          </div>
          <div class="form-group">
            <label>Field of Study <span class="req">*</span></label>
            <input v-model="profile.field" :class="{ error: errors.field }" placeholder="e.g. Computer Science" />
            <span class="err-msg" v-if="errors.field">Field of study is required</span>
          </div>
          <div class="form-group">
            <label>Specialization</label>
            <input v-model="profile.specialization" placeholder="e.g. AI / Data Science" />
          </div>
          <div class="form-group">
            <label>Institution <span class="req">*</span></label>
            <input v-model="profile.institution" :class="{ error: errors.institution }" placeholder="College name" />
            <span class="err-msg" v-if="errors.institution">Institution is required</span>
          </div>
          <div class="form-group">
            <label>University / Board</label>
            <input v-model="profile.university" placeholder="e.g. Mumbai University" />
          </div>
          <div class="form-group">
            <label>Start Year</label>
            <input v-model="profile.startYear" placeholder="e.g. 2018" maxlength="4" />
          </div>
          <div class="form-group">
            <label>Year of Passing <span class="req">*</span></label>
            <input v-model="profile.year" :class="{ error: errors.year }" placeholder="e.g. 2022" maxlength="4" />
            <span class="err-msg" v-if="errors.year">Year is required</span>
          </div>
          <div class="form-group">
            <label>Grading System</label>
            <input v-model="profile.gradingSystem" placeholder="CGPA / Percentage" />
          </div>
          <div class="form-group">
            <label>CGPA / Percentage</label>
            <input v-model="profile.cgpa" placeholder="e.g. 8.4 / 78%" />
          </div>
          <div class="form-group">
            <label>Highest Qualification <span class="req">*</span></label>
            <select v-model="profile.highestQualification" class="select-box">
              <option disabled value="">Select Qualification</option>
              <option>BCA</option><option>MCA</option><option>B.Tech</option>
              <option>M.Tech</option><option>BSc</option><option>MSc</option>
              <option>BBA</option><option>MBA</option><option>PhD</option>
              <option>Diploma</option><option>Other</option>
            </select>
          </div>
          <div class="form-group full">
            <label>Certificate URL</label>
            <input v-model="profile.certificateUrl" :class="{ error: errors.certificateUrl }" placeholder="Paste scanned certificate link" />
            <span class="err-msg" v-if="errors.certificateUrl">Enter valid URL (http/https)</span>
          </div>
        </div>
        <div class="nav-row">
          <button class="btn-prev" @click="prev">← Back</button>
          <button class="btn-next" @click="handleEducationNext">Next →</button>
        </div>
      </div>

      <!-- STEP 4 — PREVIOUS EMPLOYMENT (optional for freshers) -->
      <div v-if="!viewMode && currentStep === 3" class="form-card">
        <div class="card-title">Previous Employment</div>

        <!-- Fresher toggle -->
        <div class="fresher-toggle">
          <label class="checkbox-label">
            <input type="checkbox" v-model="profile.isFresher" />
            <span>I am a fresher (no prior work experience)</span>
          </label>
        </div>

        <div v-if="!profile.isFresher" class="form-grid" style="margin-top:18px;">
          <div class="form-group">
            <label>Company Name <span class="req">*</span></label>
            <input v-model="profile.company" :class="{ error: errors.company }" placeholder="Previous employer" />
            <span class="err-msg" v-if="errors.company">Company name is required</span>
          </div>
          <div class="form-group">
            <label>Role / Designation <span class="req">*</span></label>
            <input v-model="profile.role" :class="{ error: errors.role }" placeholder="e.g. Software Engineer" />
            <span class="err-msg" v-if="errors.role">Role is required</span>
          </div>
          <div class="form-group">
            <label>Employment Type</label>
            <input v-model="profile.employmentType" placeholder="Full-time / Intern / Contract" />
          </div>
          <div class="form-group">
            <label>Start Date <span class="req">*</span></label>
            <input type="date" v-model="profile.start" :class="{ error: errors.start }" />
            <span class="err-msg" v-if="errors.start">Start date is required</span>
          </div>
          <div class="form-group">
            <label>End Date <span class="req">*</span></label>
            <input type="date" v-model="profile.end" :class="{ error: errors.end }" />
            <span class="err-msg" v-if="errors.end">End date is required</span>
          </div>
          <div class="form-group">
            <label>Last Drawn CTC</label>
            <input v-model="profile.lastDrawnCTC" placeholder="e.g. 5,00,000" />
          </div>
          <div class="form-group">
            <label>Currency</label>
            <input v-model="profile.currency" placeholder="INR / USD" />
          </div>
          <div class="form-group">
            <label>Reason for Leaving</label>
            <input v-model="profile.leavingReason" placeholder="Optional" />
          </div>
          <div class="form-group">
            <label>Relieving Letter URL</label>
            <input v-model="profile.relievingLetterUrl" placeholder="Paste relieving letter link" />
          </div>
          <div class="form-group">
            <label>Experience Letter URL</label>
            <input v-model="profile.experienceLetterUrl" placeholder="Paste experience letter link" />
          </div>
          <div class="form-group">
            <label>Verified</label>
            <select v-model="profile.empVerified" class="small-select">
              <option :value="false">No</option>
              <option :value="true">Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label>Verified By (HR ID)</label>
            <input v-model="profile.verifiedBy" placeholder="HR Employee ID" />
          </div>
        </div>

        <div class="nav-row">
          <button class="btn-prev" @click="prev">← Back</button>
          <button class="btn-next" @click="handleEmploymentNext">Next →</button>
        </div>
      </div>

      <!-- STEP 5 — IDENTITY DETAILS -->
      <div v-if="!viewMode && currentStep === 4" class="form-card">
        <div class="card-title">Identity Details</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Identity Type <span class="req">*</span></label>
            <select v-model="profile.identityType" class="small-select" @change="profile.identityNumber = ''">
              <option disabled value="">Select</option>
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Passport</option>
              <option>Driving License</option>
              <option>Voter ID</option>
            </select>
            <span class="err-msg" v-if="errors.identityType">Please select identity type</span>
          </div>

          <div class="form-group">
            <label>Identity Number <span class="req">*</span></label>
            <input
              v-model="profile.identityNumber"
              :class="{ error: errors.identityNumber }"
              :placeholder="identityPlaceholder"
              :maxlength="identityMaxLength"
              @input="enforceIdentityFormat"
            />
            <span class="err-hint" v-if="identityHint">{{ identityHint }}</span>
            <span class="err-msg" v-if="errors.identityNumber">{{ errors.identityNumber }}</span>
          </div>

          <div class="form-group">
            <label>Name on Document</label>
            <input v-model="profile.nameOnDocument" />
          </div>
          <div class="form-group">
            <label>Issued By</label>
            <input v-model="profile.issuedBy" />
          </div>
          <div class="form-group">
            <label>Issue Date</label>
            <input type="date" v-model="profile.issueDate" />
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" v-model="profile.expiryDate" />
          </div>
          <div class="form-group">
            <label>Document URL</label>
            <input v-model="profile.documentUrl" />
          </div>
          <div class="form-group">
            <label>Verified</label>
            <select v-model="profile.identityVerified" class="small-select">
              <option :value="false">No</option>
              <option :value="true">Yes</option>
            </select>
          </div>
        </div>
        <div class="nav-row">
          <button class="btn-prev" @click="prev">← Back</button>
          <button class="btn-next" @click="handleIdentityNext">Next →</button>
        </div>
      </div>

      <!-- STEP 6 — DOCUMENTS -->
      <div v-if="!viewMode && currentStep === 5" class="form-card">
        <div class="card-title">Documents</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Document Type <span class="req">*</span></label>
            <select v-model="profile.docType" class="small-select">
              <option disabled value="">Select</option>
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Resume</option>
              <option>Certificate</option>
              <option>Experience Letter</option>
            </select>
          </div>
          <div class="form-group">
            <label>File Name <span class="req">*</span></label>
            <input v-model="profile.fileName" placeholder="Original file name" />
          </div>
          <div class="form-group doc-preview">
            <label>File URL <span class="req">*</span></label>
            <div class="input-with-icon">
              <input v-model="profile.fileUrl" placeholder="S3 / storage link" />
              <span class="eye-icon" v-if="profile.fileUrl" @click="previewDoc(profile.fileUrl)" title="View Document">👁️</span>
            </div>
          </div>
          <div class="form-group">
            <label>File Size (KB)</label>
            <input v-model="profile.fileSizeKb" type="number" />
          </div>
          <div class="form-group">
            <label>MIME Type</label>
            <input v-model="profile.mimeType" placeholder="application/pdf" />
          </div>
          <div class="form-group full">
            <label>Description</label>
            <input v-model="profile.description" placeholder="Optional notes" />
          </div>
          <div class="form-group">
            <label>Is Confidential</label>
            <select v-model="profile.isConfidential" class="small-select">
              <option :value="false">No</option>
              <option :value="true">Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="date" v-model="profile.docExpiry" />
          </div>
        </div>

        <div class="documents-list" v-if="documents.length > 0">
          <h4>Uploaded Documents</h4>
          <table class="documents-table">
            <thead>
              <tr>
                <th>Document Type</th><th>File Name</th><th>Preview</th><th>File Size</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, index) in documents" :key="index">
                <td data-label="Document Type">{{ doc.docType }}</td>
                <td data-label="File Name">{{ doc.fileName }}</td>
                <td data-label="Preview"><span class="eye-icon" @click="previewDoc(doc.fileUrl)">👁️</span></td>
                <td data-label="File Size">{{ doc.fileSizeKb }} KB</td>
                <td data-label="Actions"><button class="btn-delete" @click="deleteDocument(index)">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="nav-row">
          <button class="btn-prev" @click="prev">← Back</button>
          <div class="nav-actions">
            <button class="btn-add" @click="addDocument">Add Document</button>
            <button class="btn-save" @click="saveProfile">Save Profile</button>
          </div>
        </div>
      </div>

    </div>
  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'

const STORAGE_KEY = 'hrms_employee_profile'
const DOCS_KEY = 'hrms_employee_documents'

export default {
  components: { UserLayout },

  data() {
    return {
      currentStep: 0,
      viewMode: false,
      milestones: ['Personal', 'Address', 'Education', 'Employment', 'Identity', 'Documents'],
      errors: {},
      documents: [],
      saved: {},

      profile: {
        dob: '', nationality: '', blood: '', maritalStatus: '',
        profilePhotoUrl: '', emergencyName: '', emergencyRelation: '', emergencyPhone: '',

        addressType: '', address: '', address2: '', landmark: '',
        city: '', state: '', country: '', pincode: '',
        sameAsCurrent: false,
        permAddress: '', permAddress2: '', permLandmark: '',
        permCity: '', permState: '', permCountry: '', permPincode: '',

        degree: '', field: '', specialization: '', institution: '',
        university: '', startYear: '', year: '', gradingSystem: '',
        cgpa: '', highestQualification: '', certificateUrl: '',

        isFresher: false,
        company: '', role: '', employmentType: '', start: '', end: '',
        lastDrawnCTC: '', currency: '', leavingReason: '',
        relievingLetterUrl: '', experienceLetterUrl: '',
        empVerified: false, verifiedBy: '', verifiedAt: '',

        identityType: '', identityNumber: '', nameOnDocument: '',
        issuedBy: '', issueDate: '', expiryDate: '', documentUrl: '',
        identityVerified: false,

        docType: '', fileName: '', fileUrl: '', fileSizeKb: '',
        mimeType: '', description: '', isConfidential: false, docExpiry: ''
      }
    }
  },

  computed: {
    fillWidth() {
      return `${(this.currentStep / (this.milestones.length - 1)) * 100}%`
    },

    identityPlaceholder() {
      const map = {
        'Aadhaar': '12-digit number',
        'PAN': 'ABCDE1234F',
        'Passport': 'A1234567',
        'Driving License': 'MH01 20110012345',
        'Voter ID': 'ABC1234567'
      }
      return map[this.profile.identityType] || 'Enter identity number'
    },

    identityMaxLength() {
      const map = {
        'Aadhaar': 12, 'PAN': 10, 'Passport': 8,
        'Driving License': 16, 'Voter ID': 10
      }
      return map[this.profile.identityType] || 20
    },

    identityHint() {
      const map = {
        'Aadhaar': '12 digits only',
        'PAN': '5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)',
        'Passport': '1 letter + 7 digits (e.g. A1234567)',
        'Driving License': 'State code + digits',
        'Voter ID': '3 letters + 7 digits'
      }
      return map[this.profile.identityType] || ''
    }
  },

  mounted() {
    this.loadFromStorage()
  },

  methods: {
    // ══════════════════ STORAGE ══════════════════
    getStorageKey() {
      const code = this.getEmployeeCode()
      return code ? `${STORAGE_KEY}_${code}` : STORAGE_KEY
    },

    getDocsKey() {
      const code = this.getEmployeeCode()
      return code ? `${DOCS_KEY}_${code}` : DOCS_KEY
    },

    saveToStorage() {
      try {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.profile))
        localStorage.setItem(this.getDocsKey(), JSON.stringify(this.documents))
      } catch (e) {
        console.warn('Storage save failed', e)
      }
    },

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.getStorageKey())
        const docs = localStorage.getItem(this.getDocsKey())
        if (raw) {
          const data = JSON.parse(raw)
          this.profile = { ...this.profile, ...data }
          this.saved = { ...data }
          if (docs) this.documents = JSON.parse(docs)
          // If profile has been saved before, show view mode
          if (data._completed) {
            this.viewMode = true
          }
        }
      } catch (e) {
        console.warn('Storage load failed', e)
      }
    },

    // ══════════════════ HELPERS ══════════════════
    getToken() {
      return sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')
    },

    getEmployeeCode() {
      return sessionStorage.getItem('employeeCode') || localStorage.getItem('employeeCode') || null
    },

    prev() { this.currentStep-- },

    startEdit() {
      this.viewMode = false
      this.currentStep = 0
    },

    formatDate(d) {
      if (!d) return ''
      try {
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      } catch { return d }
    },

    formatAddress(type) {
      if (type === 'current') {
        const p = this.saved
        return [p.address, p.address2, p.landmark, p.city, p.state, p.pincode, p.country]
          .filter(Boolean).join(', ') || '—'
      } else {
        const p = this.saved
        if (p.sameAsCurrent) return 'Same as current address'
        return [p.permAddress, p.permAddress2, p.permLandmark, p.permCity, p.permState, p.permPincode, p.permCountry]
          .filter(Boolean).join(', ') || '—'
      }
    },

    maskIdentity(num, type) {
      if (!num) return '—'
      if (type === 'Aadhaar') return 'XXXX XXXX ' + num.slice(-4)
      if (type === 'PAN') return num.slice(0, 2) + 'XXXXX' + num.slice(-3)
      return num.slice(0, 2) + '***' + num.slice(-2)
    },

    // ══════════════════ SAME AS CURRENT ══════════════════
    syncPermAddress() {
      if (this.profile.sameAsCurrent) {
        this.profile.permAddress = this.profile.address
        this.profile.permAddress2 = this.profile.address2
        this.profile.permLandmark = this.profile.landmark
        this.profile.permCity = this.profile.city
        this.profile.permState = this.profile.state
        this.profile.permCountry = this.profile.country
        this.profile.permPincode = this.profile.pincode
      }
    },

    // ══════════════════ IDENTITY FORMAT ENFORCEMENT ══════════════════
    enforceIdentityFormat() {
      let val = this.profile.identityNumber
      const type = this.profile.identityType

      if (type === 'Aadhaar') {
        // Only digits, max 12
        val = val.replace(/\D/g, '').slice(0, 12)
      } else if (type === 'PAN') {
        // 5 letters + 4 digits + 1 letter, uppercase
        val = val.toUpperCase().slice(0, 10)
        // Allow only alphanumeric but enforce pattern loosely
        val = val.replace(/[^A-Z0-9]/g, '')
      } else if (type === 'Passport') {
        // 1 letter + 7 digits
        val = val.toUpperCase().slice(0, 8)
        val = val.replace(/[^A-Z0-9]/g, '')
      } else if (type === 'Voter ID') {
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
      } else if (type === 'Driving License') {
        val = val.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 16)
      }

      this.profile.identityNumber = val
    },

    validateIdentity() {
      const val = this.profile.identityNumber
      const type = this.profile.identityType
      if (!type) { this.errors.identityType = true; return false }
      if (!val) { this.errors.identityNumber = 'Identity number is required'; return false }

      if (type === 'Aadhaar' && !/^\d{12}$/.test(val)) {
        this.errors.identityNumber = 'Aadhaar must be 12 digits'; return false
      }
      if (type === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) {
        this.errors.identityNumber = 'PAN format: ABCDE1234F'; return false
      }
      if (type === 'Passport' && !/^[A-Z]{1}[0-9]{7}$/.test(val)) {
        this.errors.identityNumber = 'Passport: 1 letter + 7 digits'; return false
      }
      return true
    },

    // ══════════════════ VALIDATION ══════════════════
    validateStep(step) {
      this.errors = {}
      const p = this.profile

      if (step === 0) {
        if (!p.dob) this.errors.dob = true
        if (!p.nationality) this.errors.nationality = true
        if (!p.blood) this.errors.blood = true
        if (!p.emergencyPhone) this.errors.emergencyPhone = true
      }
      if (step === 1) {
        if (!p.address) this.errors.address = true
        if (!p.city) this.errors.city = true
        if (!p.state) this.errors.state = true
        if (!p.pincode || !/^\d{6}$/.test(p.pincode)) this.errors.pincode = true
      }
      if (step === 2) {
        if (!p.degree) this.errors.degree = true
        if (!p.field) this.errors.field = true
        if (!p.institution) this.errors.institution = true
        if (!p.year) this.errors.year = true
      }
      if (step === 3 && !p.isFresher) {
        if (!p.company) this.errors.company = true
        if (!p.role) this.errors.role = true
        if (!p.start) this.errors.start = true
        if (!p.end) this.errors.end = true
      }

      return Object.keys(this.errors).length === 0
    },

    // ══════════════════ STEP HANDLERS ══════════════════
    async handlePersonalNext() {
      if (!this.validateStep(0)) return
      this.saveToStorage()

      const code = this.getEmployeeCode()
      if (code) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/personal/basic`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              dateOfBirth: this.profile.dob,
              maritalStatusLkpId: this.profile.maritalStatus ? 1 : null,
              bloodGroupLkpId: this.profile.blood ? 1 : null,
              profilePhotoUrl: this.profile.profilePhotoUrl,
              nationality: this.profile.nationality,
              emergencyContactName: this.profile.emergencyName,
              emergencyContactPhone: this.profile.emergencyPhone,
              emergencyRelation: this.profile.emergencyRelation
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      this.currentStep++
    },

    async handleAddressNext() {
      if (!this.validateStep(1)) return
      this.saveToStorage()

      const code = this.getEmployeeCode()
      if (code) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/address`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              addressTypeLkpId: 1, line1: this.profile.address, line2: this.profile.address2,
              cityId: 1, stateId: 1, pincode: this.profile.pincode, countryCode: "IN"
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      this.currentStep++
    },

    async handleEducationNext() {
      if (!this.validateStep(2)) return
      this.saveToStorage()

      const code = this.getEmployeeCode()
      if (code) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/education`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              degree: this.profile.degree, institution: this.profile.institution,
              fieldOfStudy: this.profile.field, startYear: Number(this.profile.startYear),
              endYear: Number(this.profile.year), grade: this.profile.cgpa, isHighest: true
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      this.currentStep++
    },

    async handleEmploymentNext() {
      if (!this.validateStep(3)) return
      this.saveToStorage()

      const code = this.getEmployeeCode()
      if (code && !this.profile.isFresher) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/previous-employment`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              companyName: this.profile.company, designation: this.profile.role,
              startDate: this.profile.start, endDate: this.profile.end,
              reasonForLeaving: this.profile.leavingReason
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      this.currentStep++
    },

    async handleIdentityNext() {
      this.errors = {}
      if (!this.validateIdentity()) return
      this.saveToStorage()

      const code = this.getEmployeeCode()
      if (code) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/identity`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              identityTypeLkpId: 1, identityNumber: this.profile.identityNumber,
              expiryDate: this.profile.expiryDate || null
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      this.currentStep++
    },

    async saveProfile() {
      const code = this.getEmployeeCode()

      if (code) {
        try {
          const res = await fetch(`http://localhost:3000/api/employees/${code}/document`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
            body: JSON.stringify({
              docTypeLkpId: 1, fileName: this.profile.fileName, fileUrl: this.profile.fileUrl,
              fileSizeBytes: Number(this.profile.fileSizeKb) * 1024,
              mimeType: this.profile.mimeType, description: this.profile.description
            })
          })
          const data = await res.json()
          if (!res.ok) { alert(data.error); return }
        } catch (err) { console.error(err) }
      }

      // Mark completed and save to localStorage
      this.profile._completed = true
      this.saveToStorage()
      this.saved = { ...this.profile }
      this.viewMode = true
    },

    // ══════════════════ UI HELPERS ══════════════════
    addDocument() {
      if (!this.profile.docType || !this.profile.fileName || !this.profile.fileUrl) {
        alert('Please fill Document Type, File Name, and File URL before adding.')
        return
      }
      this.documents.push({
        docType: this.profile.docType,
        fileName: this.profile.fileName,
        fileUrl: this.profile.fileUrl,
        fileSizeKb: this.profile.fileSizeKb,
        mimeType: this.profile.mimeType,
        description: this.profile.description,
        isConfidential: this.profile.isConfidential,
        docExpiry: this.profile.docExpiry
      })
      // Clear doc fields after adding
      this.profile.docType = ''
      this.profile.fileName = ''
      this.profile.fileUrl = ''
      this.profile.fileSizeKb = ''
      this.profile.mimeType = ''
      this.profile.description = ''
      this.profile.isConfidential = false
      this.profile.docExpiry = ''
      this.saveToStorage()
    },

    deleteDocument(index) {
      this.documents.splice(index, 1)
      this.saveToStorage()
    },

    previewDoc(url) {
      window.open(url, "_blank")
    }
  }
}
</script>

<style scoped>

/* ─── MILESTONE BAR ────────────────────────────── */
.milestone-wrapper {
  position: relative;
  margin-bottom: 28px;
  padding-top: 8px;
}
.milestone-track-bg {
  position: absolute; top: 26px; left: 0; right: 0;
  height: 3px; background: #e2eee5; border-radius: 2px; z-index: 0;
}
.milestone-track-fill {
  position: absolute; top: 26px; left: 18px;
  height: 3px; background: #2e7d32; border-radius: 2px; z-index: 1;
  transition: width 0.45s ease;
}
.milestone-steps {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between;
}
.ms { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.ms-dot {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 2.5px solid #d8e8da;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #9cb8a0;
  transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.ms.active .ms-dot { background: #e8f5e9; border-color: #2e7d32; color: #2e7d32; box-shadow: 0 0 0 4px rgba(46,125,50,0.12); }
.ms.done .ms-dot { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.ms-label { font-size: 11px; color: #9cb8a0; font-weight: 500; letter-spacing: 0.3px; }
.ms.active .ms-label { color: #2e7d32; font-weight: 600; }
.ms.done .ms-label { color: #2e7d32; }

/* ─── VIEW MODE ─────────────────────────────────── */
.profile-view { display: flex; flex-direction: column; gap: 16px; }

.profile-header-card {
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
  border-radius: 16px; padding: 24px 28px;
  display: flex; align-items: center; gap: 20px;
  box-shadow: 0 8px 24px rgba(46,125,50,0.25);
}
.profile-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(255,255,255,0.2); overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid rgba(255,255,255,0.4); flex-shrink: 0;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { display: flex; align-items: center; justify-content: center; }
.profile-header-info { flex: 1; }
.profile-name { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 10px; }
.profile-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.badge {
  background: rgba(255,255,255,0.2); color: #fff;
  padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 500;
}
.btn-edit-top {
  display: flex; align-items: center; gap: 7px;
  background: #fff; color: #2e7d32;
  border: none; padding: 10px 20px; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.btn-edit-top:hover { background: #e8f5e9; transform: translateY(-1px); }

.view-sections {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.view-card {
  background: #fff; border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  padding: 20px 24px; border: 1px solid #eef5ef;
}
.view-card.full-width { grid-column: 1 / -1; }
.view-card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: #1e261f;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid #e8f0e8;
}
.view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.view-field { display: flex; flex-direction: column; gap: 3px; }
.view-field.full { grid-column: 1 / -1; }
.vf-label { font-size: 11px; color: #9cb8a0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.vf-val { font-size: 13px; color: #1e261f; font-weight: 500; }

.fresher-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: #e8f5e9; color: #2e7d32;
  padding: 10px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 500;
}
.pill-yes { background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.pill-no { background: #fce4e4; color: #c62828; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.empty-docs { color: #9cb8a0; font-size: 13px; font-style: italic; padding: 10px 0; }

/* ─── FRESHER TOGGLE ────────────────────────────── */
.fresher-toggle {
  background: #f4faf4; border: 1.5px solid #c8deca;
  border-radius: 10px; padding: 14px 18px; margin-bottom: 4px;
}

/* ─── FORM CARD ─────────────────────────────────── */
.form-card {
  background: #fff; border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
  padding: 24px 28px;
}

.card-title {
  font-size: 16px; font-weight: 600; color: #1e261f;
  margin-bottom: 20px; padding-bottom: 14px;
  border-bottom: 1px solid #e8f0e8;
}
.sub-card {
  background: #fafcfa; border-radius: 12px; padding: 20px;
  margin-bottom: 18px; border: 1px solid #eef5ef;
}
.sub-card-title { font-size: 14px; font-weight: 600; color: #2e7d32; margin-bottom: 14px; }
.perm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

/* ─── FORM GRID ─────────────────────────────────── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 12px; font-weight: 500; color: #6b7d6f; letter-spacing: 0.2px; }
.req { color: #d32f2f; margin-left: 2px; }
.form-group input, .form-group select {
  height: 40px; border-radius: 8px; border: 1.5px solid #e2eee5;
  padding: 0 12px; font-size: 13px; color: #1e261f;
  background: #fafcfa; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus, .form-group select:focus {
  border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,0.1); background: #fff;
}
.form-group input:disabled { background: #f0f4f0; color: #aaa; cursor: not-allowed; }
.form-group input.error { border-color: #e53935; background: #fff8f8; }
.err-msg { font-size: 11px; color: #e53935; margin-top: 2px; }
.err-hint { font-size: 11px; color: #6b7d6f; margin-top: 2px; font-style: italic; }

.small-select { height: 40px; font-size: 12px; padding: 0 10px; border-radius: 6px; border: 1.5px solid #e2eee5; background: #fafcfa; }
.select-box { height: 40px; border-radius: 8px; border: 1.5px solid #e2eee5; padding: 0 12px; font-size: 13px; background: #fafcfa; color: #1e261f; outline: none; }
.select-box:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,0.1); background: #fff; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon input { width: 100%; padding-right: 40px; }
.eye-icon { cursor: pointer; font-size: 18px; opacity: 0.7; transition: opacity 0.2s, transform 0.2s; }
.input-with-icon .eye-icon { position: absolute; right: 10px; }
.eye-icon:hover { opacity: 1; transform: scale(1.1); }

/* ─── CHECKBOX ──────────────────────────────────── */
.checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #1e261f; cursor: pointer; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #2e7d32; cursor: pointer; }

/* ─── NAV ROW ───────────────────────────────────── */
.nav-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 24px; padding-top: 20px; border-top: 1px solid #e8f0e8;
}
.nav-actions { display: flex; gap: 10px; }

.btn-next { background: #2e7d32; color: #fff; border: none; padding: 10px 26px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.1s; }
.btn-next:hover { background: #256427; }
.btn-prev { background: #f4faf4; color: #2e7d32; border: 1.5px solid #c8deca; padding: 10px 22px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-prev:hover { background: #e8f5e9; }
.btn-save { background: #1b5e20; color: #fff; border: none; padding: 10px 26px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-save:hover { background: #163d18; }
.btn-add { background: #2e7d32; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-add:hover { background: #256427; }

/* ─── DOCUMENTS TABLE ───────────────────────────── */
.documents-list { margin-top: 20px; }
.documents-list h4 { font-size: 15px; font-weight: 600; color: #1e261f; margin-bottom: 10px; }
.documents-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.documents-table th, .documents-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e8f0e8; font-size: 13px; }
.documents-table th { font-weight: 600; color: #1e261f; background: #fafcfa; }
.btn-delete { background: #d32f2f; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
.btn-delete:hover { background: #b71c1c; }

/* ─── RESPONSIVE ────────────────────────────────── */
@media (max-width: 768px) {
  .view-sections { grid-template-columns: 1fr; }
  .view-card.full-width { grid-column: 1; }
  .profile-header-card { flex-wrap: wrap; }
  .documents-table thead tr { position: absolute; top: -9999px; left: -9999px; }
  .documents-table, .documents-table tbody, .documents-table td, .documents-table tr { display: block; }
  .documents-table tr { border: 1px solid #e8f0e8; border-radius: 8px; margin-bottom: 8px; padding: 8px; }
  .documents-table td { border: none; border-bottom: 1px solid #f0f9f0; position: relative; padding-left: 50%; }
  .documents-table td:before { content: attr(data-label); position: absolute; left: 8px; width: 45%; font-weight: 600; color: #6b7d6f; }
}
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: 1; }
  .view-grid { grid-template-columns: 1fr; }
  .ms-label { display: none; }
}
</style>