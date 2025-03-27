import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [email, setEmail] = useState('')
  const [showAddressFields, setShowAddressFields] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  })

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    setPasswordError('')
    return true
  }

  const onSubmitHandler = async (event) => {
      event.preventDefault();
      try {
        if (currentState === 'Sign Up') {
        // Validate passwords match
        if (!validatePasswords()) {
          return;
        }
        
        const requestData = {
          name, 
          email, 
          password,
          shippingAddress: showAddressFields ? shippingAddress : undefined
        };
        
        console.log("Signup request data:", requestData);
        console.log("Shipping address enabled:", showAddressFields);
        console.log("Shipping address data:", shippingAddress);

        const response = await axios.post(backendUrl + '/api/user/register', requestData);
        
        console.log("Signup response:", response.data);
        
          if (response.data.success) {
            setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          
          // Test the authentication immediately
          try {
            console.log("Testing auth with token:", response.data.token);
            const testAuthResponse = await axios.get(backendUrl + '/api/user/test-auth', {
              headers: { token: response.data.token }
            });
            console.log("Auth test response:", testAuthResponse.data);
          } catch (err) {
            console.error("Auth test failed:", err);
          }
          } else {
            toast.error(response.data.message)
          }

        } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
          if (response.data.success) {
            setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          
          // Test auth after login too
          try {
            console.log("Testing auth after login with token:", response.data.token);
            const testAuthResponse = await axios.get(backendUrl + '/api/user/test-auth', {
              headers: { token: response.data.token }
            });
            console.log("Auth test after login response:", testAuthResponse.data);
          } catch (err) {
            console.error("Auth test after login failed:", err);
          }
          } else {
            toast.error(response.data.message)
          }
        }

      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
      
      {/* Only show these fields for Sign Up */}
      {currentState === 'Sign Up' && (
        <input 
          onChange={(e) => setName(e.target.value)} 
          value={name} 
          type="text" 
          className='w-full px-3 py-2 border border-gray-800' 
          placeholder='Name' 
          required
        />
      )}
      
      <input 
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
        type="email" 
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Email' 
        required
      />
      
      <input 
        onChange={(e) => setPassword(e.target.value)} 
        value={password} 
        type="password" 
        className='w-full px-3 py-2 border border-gray-800' 
        placeholder='Password' 
        required
      />
      
      {/* Password confirmation field for Sign Up */}
      {currentState === 'Sign Up' && (
        <>
          <input 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            value={confirmPassword}
            onBlur={validatePasswords}
            type="password" 
            className='w-full px-3 py-2 border border-gray-800' 
            placeholder='Confirm Password' 
            required
          />
          {passwordError && <p className="text-red-500 text-sm w-full text-left">{passwordError}</p>}
          
          <div className="w-full flex items-start gap-2 mt-2">
            <input 
              type="checkbox" 
              id="addShippingAddress" 
              checked={showAddressFields} 
              onChange={() => setShowAddressFields(!showAddressFields)}
            />
            <label htmlFor="addShippingAddress">Add shipping address (for faster checkout)</label>
          </div>
          
          {/* Shipping Address Fields */}
          {showAddressFields && (
            <div className="w-full border p-4 mt-2 rounded">
              <p className="font-medium mb-3">Shipping Address</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="firstName"
                  value={shippingAddress.firstName}
                  onChange={handleAddressChange}
                  placeholder="First Name"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  required={showAddressFields}
                />
                <input
                  type="text"
                  name="lastName"
                  value={shippingAddress.lastName}
                  onChange={handleAddressChange}
                  placeholder="Last Name"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  required={showAddressFields}
                />
              </div>
              <input
                type="text"
                name="street"
                value={shippingAddress.street}
                onChange={handleAddressChange}
                placeholder="Street Address"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                required={showAddressFields}
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  required={showAddressFields}
                />
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  placeholder="State/Province"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="zipcode"
                  value={shippingAddress.zipcode}
                  onChange={handleAddressChange}
                  placeholder="Postal/ZIP Code"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  required={showAddressFields}
                />
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                  required={showAddressFields}
                />
              </div>
              <input
                type="text"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleAddressChange}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required={showAddressFields}
              />
            </div>
          )}
        </>
      )}
      
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forgot your password?</p>
            {
              currentState === 'Login' 
            ? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
            : <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login Here</p>
            }
        </div>
      <button 
        className='bg-black text-white font-light px-8 py-2 mt-4'
        disabled={currentState === 'Sign Up' && passwordError}
      >
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}

export default Login
