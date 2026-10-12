import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setRegistrationStep,
  updateRegistrationForm,
  resetRegistrationForm,
  submitPatientRegistration,
  RegistrationFormData
} from '../../store/slices/patientSlice';
import {
  User,
  Phone,
  HeartPulse,
  FileText,
  MapPin,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  clean10DigitPhone,
  validate10DigitPhone,
  format10DigitPhone,
  cleanPincode,
  validatePincode,
  validateEmail
} from '../../utils/validation';

interface PatientRegistrationWizardProps {
  onComplete?: () => void;
}

export const PatientRegistrationWizard: React.FC<PatientRegistrationWizardProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const { registrationStep, registrationForm } = useAppSelector(state => state.patient);
  const doctors = useAppSelector(state => state.doctor.doctors);

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    defaultValues: registrationForm,
    mode: 'onChange'
  });

  const steps = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Emergency Contact', icon: Phone },
    { number: 3, title: 'Medical Info', icon: HeartPulse },
    { number: 4, title: 'Documents', icon: FileText },
    { number: 5, title: 'Address Info', icon: MapPin },
    { number: 6, title: 'Assign Doctor', icon: Stethoscope },
    { number: 7, title: 'Review & Submit', icon: CheckCircle2 }
  ];

  const handleNextStep = (data: Partial<RegistrationFormData>) => {
    dispatch(updateRegistrationForm(data));
    if (registrationStep < 7) {
      dispatch(setRegistrationStep(registrationStep + 1));
    }
  };

  const handlePrevStep = () => {
    if (registrationStep > 1) {
      dispatch(setRegistrationStep(registrationStep - 1));
    }
  };

  const onFinalSubmit = () => {
    dispatch(submitPatientRegistration());
    setSubmittedSuccess(true);
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center space-y-6 max-w-2xl mx-auto shadow-md animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Patient Registration Completed!</h2>
          <p className="text-sm text-slate-600 font-medium">
            New patient <span className="text-[#0F766E] font-bold">{registrationForm.fullName || 'Record'}</span> ({registrationForm.patientId}) has been created successfully in the Naimify Smart ICU system.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-xs text-slate-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient ID:</span>
            <span className="font-bold text-slate-900">{registrationForm.patientId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Clinician:</span>
            <span className="font-bold text-[#0F766E]">{registrationForm.assignedDoctor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department / Unit:</span>
            <span className="font-bold text-slate-900">{registrationForm.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority Level:</span>
            <span className="font-bold text-rose-600">{registrationForm.priority}</span>
          </div>
        </div>

        <button
          onClick={() => {
            dispatch(resetRegistrationForm());
            setSubmittedSuccess(false);
          }}
          className="px-6 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
        >
          Register Another Patient
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm text-slate-900 max-w-4xl mx-auto selection:bg-teal-500 selection:text-white">
      {/* Step Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0F766E]" />
              Patient Registration Multi-Step Wizard
            </h2>
            <p className="text-xs text-slate-500 font-medium">Complete all 7 steps to register new ICU admission.</p>
          </div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            Step {registrationStep} of 7
          </span>
        </div>

        {/* Horizontal Step Indicator Bar */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.number === registrationStep;
            const isDone = s.number < registrationStep;
            return (
              <div
                key={s.number}
                onClick={() => isDone && dispatch(setRegistrationStep(s.number))}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] ring-2 ring-teal-600/20 shadow-xs font-bold'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] font-bold block truncate">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Personal Details */}
      {registrationStep === 1 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-extrabold text-base text-slate-900">Step 1: Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Patient ID (Auto-Generated)</label>
              <input
                {...register('patientId')}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-700 font-mono font-bold focus:outline-none cursor-not-allowed"
                readOnly
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Full Name *</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
              {errors.fullName && <span className="text-rose-600 text-[10px] block mt-1 font-bold">{errors.fullName.message}</span>}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Age *</label>
              <input
                type="number"
                {...register('age', { required: 'Age is required' })}
                placeholder="e.g. 58"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
              {errors.age && <span className="text-rose-600 text-[10px] block mt-1 font-bold">{errors.age.message}</span>}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Gender *</label>
              <select
                {...register('gender')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Blood Group *</label>
              <select
                {...register('bloodGroup')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="O+">O positive (O+)</option>
                <option value="O-">O negative (O-)</option>
                <option value="A+">A positive (A+)</option>
                <option value="A-">A negative (A-)</option>
                <option value="B+">B positive (B+)</option>
                <option value="B-">B negative (B-)</option>
                <option value="AB+">AB positive (AB+)</option>
                <option value="AB-">AB negative (AB-)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Mobile Number *</label>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                  clean10DigitPhone(watch('mobileNumber')).length === 10
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {clean10DigitPhone(watch('mobileNumber')).length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                {...register('mobileNumber', {
                  required: 'Mobile number is required',
                  validate: (val) => validate10DigitPhone(val, 'Mobile number', true),
                  onChange: (e) => {
                    e.target.value = clean10DigitPhone(e.target.value);
                  }
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = clean10DigitPhone(target.value);
                }}
                className={`w-full bg-slate-50 border ${
                  errors.mobileNumber ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors font-mono`}
              />
              {errors.mobileNumber && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.mobileNumber.message}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
              <input
                type="email"
                {...register('email', {
                  validate: (val) => validateEmail(val, 'Email address', false)
                })}
                placeholder="patient@example.com"
                className={`w-full bg-slate-50 border ${
                  errors.email ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.email && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Next: Emergency Contact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Emergency Contact Details */}
      {registrationStep === 2 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-slate-900">Step 2: Emergency Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Emergency Contact Name *</label>
              <input
                {...register('emergencyContactName', { required: 'Contact name is required' })}
                placeholder="e.g. Meena Kumar"
                className={`w-full bg-slate-50 border ${
                  errors.emergencyContactName ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.emergencyContactName && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.emergencyContactName.message}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Emergency Contact Number *</label>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                  clean10DigitPhone(watch('emergencyContactNumber')).length === 10
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {clean10DigitPhone(watch('emergencyContactNumber')).length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit contact number"
                {...register('emergencyContactNumber', {
                  required: 'Emergency contact number is required',
                  validate: (val) => validate10DigitPhone(val, 'Emergency contact number', true),
                  onChange: (e) => {
                    e.target.value = clean10DigitPhone(e.target.value);
                  }
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = clean10DigitPhone(target.value);
                }}
                className={`w-full bg-slate-50 border ${
                  errors.emergencyContactNumber ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors font-mono`}
              />
              {errors.emergencyContactNumber && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.emergencyContactNumber.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Relation *</label>
              <select
                {...register('relation')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Next: Medical Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Medical Information */}
      {registrationStep === 3 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Step 3: Medical Information</h3>
          </div>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Current Diagnosis / Reason for ICU Admission *</label>
              <textarea
                rows={2}
                {...register('currentDiagnosis', { required: 'Diagnosis is required' })}
                placeholder="e.g. Acute Respiratory Distress Syndrome (ARDS) / Post-Op Recovery"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Past Medical History</label>
              <textarea
                rows={2}
                {...register('medicalHistory')}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Previous Cardiac Stent"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Known Allergies</label>
              <input
                {...register('allergies')}
                placeholder="e.g. Penicillin, Sulfa drugs, Latex"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Next: Documents Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Documents Upload */}
      {registrationStep === 4 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-extrabold text-base text-slate-900">Step 4: Documents Upload</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2 hover:border-[#0F766E] hover:bg-teal-50/40 transition-all">
              <Upload className="w-8 h-8 text-[#0F766E] mx-auto" />
              <span className="font-bold text-slate-900 block">Aadhaar / ID Card</span>
              <p className="text-[10px] text-slate-500">PDF or JPG (Max 5MB)</p>
              <input
                type="text"
                {...register('aadhaarFile')}
                placeholder="Aadhaar_Card_Copy.pdf"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center text-[11px] text-[#0F766E] font-mono font-bold focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2 hover:border-[#0F766E] hover:bg-teal-50/40 transition-all">
              <Upload className="w-8 h-8 text-[#0F766E] mx-auto" />
              <span className="font-bold text-slate-900 block">Medical Reports</span>
              <p className="text-[10px] text-slate-500">X-Ray, Lab, CT Scan</p>
              <input
                type="text"
                {...register('medicalReportsFile')}
                placeholder="Diagnostic_Report.pdf"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center text-[11px] text-[#0F766E] font-mono font-bold focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2 hover:border-[#0F766E] hover:bg-teal-50/40 transition-all">
              <Upload className="w-8 h-8 text-[#0F766E] mx-auto" />
              <span className="font-bold text-slate-900 block">Prescription / Referral</span>
              <p className="text-[10px] text-slate-500">Referral letter copy</p>
              <input
                type="text"
                {...register('prescriptionFile')}
                placeholder="Referral_Prescription.pdf"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center text-[11px] text-[#0F766E] font-mono font-bold focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Next: Address Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Address Information */}
      {registrationStep === 5 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Step 5: Address Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Country *</label>
              <input
                {...register('country', { required: 'Country is required' })}
                placeholder="India"
                className={`w-full bg-slate-50 border ${
                  errors.country ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.country && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.country.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">State *</label>
              <input
                {...register('state', { required: 'State is required' })}
                placeholder="Bihar"
                className={`w-full bg-slate-50 border ${
                  errors.state ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.state && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.state.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">City *</label>
              <input
                {...register('city', { required: 'City is required' })}
                placeholder="Patna"
                className={`w-full bg-slate-50 border ${
                  errors.city ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.city && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.city.message}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Pincode *</label>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                  cleanPincode(watch('pincode')).length === 6
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {cleanPincode(watch('pincode')).length}/6 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit pincode (e.g. 800001)"
                {...register('pincode', {
                  required: 'Pincode is required',
                  validate: (val) => validatePincode(val, true),
                  onChange: (e) => {
                    e.target.value = cleanPincode(e.target.value);
                  }
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = cleanPincode(target.value);
                }}
                className={`w-full bg-slate-50 border ${
                  errors.pincode ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors font-mono`}
              />
              {errors.pincode && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.pincode.message}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1 font-bold">Address Line *</label>
              <textarea
                rows={2}
                {...register('addressLine', { required: 'Address line is required' })}
                placeholder="House/Flat No., Street Name, Landmark"
                className={`w-full bg-slate-50 border ${
                  errors.addressLine ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none transition-colors`}
              />
              {errors.addressLine && (
                <span className="text-rose-600 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {errors.addressLine.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Next: Assign Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 6: Assign Doctor */}
      {registrationStep === 6 && (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-extrabold text-base text-slate-900">Step 6: Assign Doctor & Priority</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Select Attending Doctor *</label>
              <select
                {...register('assignedDoctor')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              >
                {doctors.map(d => (
                  <option key={d.id} value={`${d.name} (${d.department})`}>
                    {d.name} - {d.department} ({d.qualification})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">ICU Department / Unit *</label>
              <select
                {...register('department')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:border-[#0F766E] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="Medical ICU">Medical ICU (MICU-01)</option>
                <option value="Surgical ICU">Surgical ICU (SICU-01)</option>
                <option value="Cardiac ICU">Cardiac ICU (CICU-01)</option>
                <option value="Neuro ICU">Neuro ICU (NICU-01)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1 font-bold">Patient Admission Priority *</label>
              <div className="grid grid-cols-4 gap-3 pt-1">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => {
                  const currentPriority = watch('priority');
                  const isSel = currentPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('priority', p)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        isSel
                          ? p === 'CRITICAL'
                            ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-xs'
                            : p === 'HIGH'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-teal-50 border-[#0F766E] text-[#0F766E] ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
            >
              <span>Review Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 7: Review & Final Submit */}
      {registrationStep === 7 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Step 7: Review Information & Submit</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[#0F766E] font-bold uppercase text-[11px] block border-b border-slate-200 pb-1">
                Personal & Emergency Details
              </span>
              <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-900">{registrationForm.fullName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Age / Gender:</span> <span className="text-slate-700">{registrationForm.age} Y / {registrationForm.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Blood Group:</span> <span className="text-rose-600 font-bold">{registrationForm.bloodGroup}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mobile:</span> <span className="text-[#0F766E] font-mono font-bold">{format10DigitPhone(registrationForm.mobileNumber)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Emergency Contact:</span> <span className="text-slate-700">{registrationForm.emergencyContactName} ({registrationForm.relation}) - <span className="font-mono text-[#0F766E] font-bold">{format10DigitPhone(registrationForm.emergencyContactNumber)}</span></span></div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[#0F766E] font-bold uppercase text-[11px] block border-b border-slate-200 pb-1">
                Clinical Assignment
              </span>
              <div className="flex justify-between"><span className="text-slate-500">Attending Doctor:</span> <span className="font-bold text-[#0F766E]">{registrationForm.assignedDoctor}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Department:</span> <span className="text-slate-900 font-bold">{registrationForm.department}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Priority:</span> <span className="font-bold text-rose-600">{registrationForm.priority}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Diagnosis:</span> <span className="text-slate-700 truncate max-w-[200px]">{registrationForm.currentDiagnosis}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-slate-500">Address / PIN:</span> <span className="text-slate-700">{registrationForm.city}, {registrationForm.state} - <span className="font-mono text-emerald-700 font-bold">{registrationForm.pincode}</span></span></div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={onFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3 rounded-xl transition-all flex items-center gap-2 text-xs shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Create Patient</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistrationWizard;
