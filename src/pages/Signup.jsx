import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Check,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = not checked, true = available, false = taken
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const navigate = useNavigate();
  
  const handlelogin = () => {
    navigate("/login");
  };

  const checkUsernameAvailability = async (username) => {
    try {
      console.log(`${import.meta.env.VITE_BASE_URI}/auth/signup/check`);

      const res = await axios.post(`${import.meta.env.VITE_BASE_URI}/auth/signup/check`, {
        username, // This now matches the backend expectation
      });
      
      return res.data.message === "Username Looks Good";
    } catch (err) {
      console.error("Username check error:", err);
      // If it's a 400 error with "Username Taken", return false
      if (err.response?.status === 400 && err.response?.data?.message === "Username Taken") {
        return false;
      }
      // For other errors, also return false but you might want to handle differently
      return false;
    }
  };

  useEffect(() => {
    const check = async () => {
      if (formData.username.length >= 3) {
        setIsCheckingUsername(true);
        const available = await checkUsernameAvailability(formData.username);
        setUsernameAvailable(available);
        setIsCheckingUsername(false);
        
        // Update validation after async check
        const validationResult = validateField("username", formData.username, available);
        setValidation((prev) => ({
          ...prev,
          username: validationResult,
        }));
      } else {
        setUsernameAvailable(null);
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(check, 500); // Debounce API calls
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const [validation, setValidation] = useState({
    username: { isValid: null, message: "" },
    email: { isValid: null, message: "" },
    password: { isValid: null, message: "" },
    confirmPassword: { isValid: null, message: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: "Enter password",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const level = Math.min(Math.floor(score / 1.5), 4);

    return {
      score: level,
      level: levels[level],
    };
  };

  const validateField = (field, value, usernameAvailabilityOverride = null) => {
    let isValid = true;
    let message = "";

    switch (field) {
      case "username":
        if (!value.trim()) {
          isValid = false;
          message = "Username is required";
        } else if (value.length < 3) {
          isValid = false;
          message = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          isValid = false;
          message = "Username can only contain letters, numbers, and underscores";
        } else {
          // Check username availability
          const availability = usernameAvailabilityOverride !== null ? usernameAvailabilityOverride : usernameAvailable;
          if (isCheckingUsername) {
            isValid = null;
            message = "Checking username availability...";
          } else if (availability === false) {
            isValid = false;
            message = "Username is already taken";
          } else if (availability === true) {
            isValid = true;
            message = "Username is available!";
          } else {
            isValid = null;
            message = "Username format is valid";
          }
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          isValid = false;
          message = "Email is required";
        } else if (!emailRegex.test(value)) {
          isValid = false;
          message = "Please enter a valid email address";
        } else {
          message = "Email format is valid!";
        }
        break;

      case "password":
        const strength = checkPasswordStrength(value);
        setPasswordStrength(strength);

        if (!value) {
          isValid = false;
          message = "Password is required";
        } else if (value.length < 8) {
          isValid = false;
          message = "Password must be at least 8 characters";
        } else if (strength.score < 2) {
          isValid = false;
          message = "Password is too weak";
        }
        break;

      case "confirmPassword":
        if (!value) {
          isValid = false;
          message = "Please confirm your password";
        } else if (value !== formData.password) {
          isValid = false;
          message = "Passwords do not match";
        } else if (formData.password) {
          message = "Passwords match!";
        }
        break;
    }

    return { isValid, message };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // For username, don't validate availability immediately as it will be handled by useEffect
    if (field === "username") {
      const validationResult = validateField(field, value, null);
      setValidation((prev) => ({
        ...prev,
        [field]: validationResult,
      }));
    } else {
      const validationResult = validateField(field, value);
      setValidation((prev) => ({
        ...prev,
        [field]: validationResult,
      }));
    }

    // Revalidate confirm password if password changes
    if (field === "password" && formData.confirmPassword) {
      const confirmValidation = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      setValidation((prev) => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation of all fields
    const finalValidation = {};
    let allValid = true;

    Object.keys(formData).forEach((field) => {
      const validationResult = validateField(field, formData[field]);
      finalValidation[field] = validationResult;
      if (!validationResult.isValid) {
        allValid = false;
      }
    });

    // Update validation state
    setValidation(finalValidation);

    if (!allValid) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    const data = {
      name: formData.username,
      email: formData.email,
      password: formData.password
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/auth/signup`,
        data
      );
      console.log(`✅ Signup success! Welcome, ${res.data.name}`);
      console.log(res.data);
      // Handle successful signup (redirect, show success message, etc.)
    } catch (err) {
      console.log(
        `❌ Signup failed: ${err.response?.data?.message || err.message}`
      );
      if (err.response?.data?.message === "Username Taken") {
        alert("Username is already taken. Please choose another one.");
        setUsernameAvailable(false);
        setValidation(prev => ({
          ...prev,
          username: { isValid: false, message: "Username is already taken" }
        }));
      } else {
        alert(`Signup failed: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Object.keys(formData).every(
    (field) => formData[field].trim() && validation[field].isValid === true
  );

  const getStrengthColor = (score) => {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#9bdab2"];
    return colors[Math.min(score - 1, 3)] || "#2d3339";
  };

  const getStrengthWidth = (score) => {
    const widths = [25, 50, 75, 100];
    return score > 0 ? widths[Math.min(score - 1, 3)] : 0;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background: "#161a1d",
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl p-10 shadow-xl  relative overflow-hidden"
          style={{
            backgroundColor: "#272d32",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Top border accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, #9bdab2, rgba(155, 218, 178, 0.6))",
            }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-4xl font-extrabold mb-2"
              style={{
                background: "linear-gradient(135deg, #f9fafb, #9bdab2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Create Account
            </h1>
            <p className="text-lg" style={{ color: "#a3a3a8" }}>
              Join our community today
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#f9fafb" }}
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={20} style={{ color: "#a3a3a8" }} />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Choose a unique username"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.username.isValid === true
                      ? "border-green-500"
                      : validation.username.isValid === false
                      ? "border-red-500"
                      : "border-transparent"
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{
                    backgroundColor: "#2d3339",
                    color: "#f9fafb",
                  }}
                />
              </div>
              {validation.username.message && (
                <div
                  className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    validation.username.isValid === true
                      ? "bg-green-500 bg-opacity-10 border-l-4 border-green-500"
                      : validation.username.isValid === false
                      ? "bg-red-500 bg-opacity-10 border-l-4 border-red-500"
                      : "bg-yellow-500 bg-opacity-10 border-l-4 border-yellow-500"
                  }`}
                >
                  {validation.username.isValid === true ? (
                    <Check size={16} className="text-green-500" />
                  ) : validation.username.isValid === false ? (
                    <AlertCircle size={16} className="text-red-500" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-500" />
                  )}
                  <span
                    style={{
                      color: validation.username.isValid === true
                        ? "#9bdab2"
                        : validation.username.isValid === false
                        ? "#ef4444"
                        : "#f59e0b",
                    }}
                  >
                    {validation.username.message}
                  </span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#f9fafb" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} style={{ color: "#a3a3a8" }} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.email.isValid === true
                      ? "border-green-500"
                      : validation.email.isValid === false
                      ? "border-red-500"
                      : "border-transparent"
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{
                    backgroundColor: "#2d3339",
                    color: "#f9fafb",
                  }}
                />
              </div>
              {validation.email.message && (
                <div
                  className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    validation.email.isValid
                      ? "bg-green-500 bg-opacity-10 border-l-4 border-green-500"
                      : "bg-red-500 bg-opacity-10 border-l-4 border-red-500"
                  }`}
                >
                  {validation.email.isValid ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                  <span
                    style={{
                      color: validation.email.isValid ? "#9bdab2" : "#ef4444",
                    }}
                  >
                    {validation.email.message}
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#f9fafb" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} style={{ color: "#a3a3a8" }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Create a strong password"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.password.isValid === true
                      ? "border-green-500"
                      : validation.password.isValid === false
                      ? "border-red-500"
                      : "border-transparent"
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{
                    backgroundColor: "#2d3339",
                    color: "#f9fafb",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-3">
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${getStrengthWidth(passwordStrength.score)}%`,
                      backgroundColor: getStrengthColor(passwordStrength.score),
                    }}
                  />
                </div>
                <p className="text-sm mt-1" style={{ color: "#a3a3a8" }}>
                  Password strength:{" "}
                  <span style={{ color: "#f9fafb" }}>
                    {passwordStrength.level}
                  </span>
                </p>
              </div>

              {validation.password.message &&
                validation.password.isValid === false && (
                  <div className="mt-2 p-3 rounded-lg text-sm flex items-center gap-2 bg-red-500 bg-opacity-10 border-l-4 border-red-500">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-red-500">
                      {validation.password.message}
                    </span>
                  </div>
                )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#f9fafb" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} style={{ color: "#a3a3a8" }} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.confirmPassword.isValid === true
                      ? "border-green-500"
                      : validation.confirmPassword.isValid === false
                      ? "border-red-500"
                      : "border-transparent"
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{
                    backgroundColor: "#2d3339",
                    color: "#f9fafb",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {validation.confirmPassword.message && (
                <div
                  className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    validation.confirmPassword.isValid
                      ? "bg-green-500 bg-opacity-10 border-l-4 border-green-500"
                      : "bg-red-500 bg-opacity-10 border-l-4 border-red-500"
                  }`}
                >
                  {validation.confirmPassword.isValid ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                  <span
                    style={{
                      color: validation.confirmPassword.isValid
                        ? "#9bdab2"
                        : "#ef4444",
                    }}
                  >
                    {validation.confirmPassword.message}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-5 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300 ${
                isFormValid && !isSubmitting
                  ? "transform hover:-translate-y-1 hover:shadow-2xl"
                  : "opacity-60 cursor-not-allowed"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #9bdab2, rgba(155, 218, 178, 0.8))",
                color: "#161a1d",
              }}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Login Link */}
          <div
            className="text-center mt-8 pt-8 border-t"
            style={{ borderColor: "#2d3339" }}
          >
            <p style={{ color: "#a3a3a8" }}>
              Already have an account?{" "}
              <button
                onClick={() => handlelogin()}
                className="font-semibold transition-colors duration-200 hover:opacity-80"
                style={{ color: "#9bdab2" }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;