import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Eye, EyeOff, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import ky from 'ky'
import { useNavigate } from 'react-router-dom'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const navigate = useNavigate()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber
    }
  }

  const passwordStrength = validatePassword(formData.password)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!passwordStrength.isValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Please accept the Terms and Conditions')
      setLoading(false)
      return
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      }
      await ky.post('http://localhost:5000/api/auth/register', { json: payload }).json()
      navigate('/login')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join us today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="name@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}</button>
              </div>

              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${passwordStrength.minLength ? 'text-green-500' : 'text-gray-300'}`} /><span className={`text-xs ${passwordStrength.minLength ? 'text-green-700' : 'text-gray-500'}`}>At least 8 characters</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasUpperCase ? 'text-green-500' : 'text-gray-300'}`} /><span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-700' : 'text-gray-500'}`}>One uppercase letter</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasLowerCase ? 'text-green-500' : 'text-gray-300'}`} /><span className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-700' : 'text-gray-500'}`}>One lowercase letter</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-300'}`} /><span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-500'}`}>One number</span></div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}</button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (<p className="mt-2 text-xs text-red-600">Passwords do not match</p>)}
            </div>

            <div className="flex items-start">
              <input id="terms" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Terms and Conditions</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Privacy Policy</a></label>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{loading ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Creating Account...</span>) : ('Create Account')}</button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a></p>
        </div>
      </div>
    </div>
  )
}