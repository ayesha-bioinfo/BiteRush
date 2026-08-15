import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./SignUp.css";

function SignUp() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      await register(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password
      );

      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );

      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (error) {
      setError(
        error.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">

      <div className="signup-container">

        {/* LEFT SIDE */}

        <section className="signup-showcase">

          <div className="signup-showcase-content">

            <span className="signup-eyebrow">
              JOIN BITERUSH
            </span>

            <h1>
              Great food starts with
              <span> one account.</span>
            </h1>

            <p>
              Create your BiteRush account to place
              orders, save your order history and enjoy
              a faster food delivery experience.
            </p>


            <div className="signup-benefits">

              <div>
                <UserPlus size={20} />

                <span>
                  Quick account creation
                </span>
              </div>

              <div>
                <ShieldCheck size={20} />

                <span>
                  Secure password protection
                </span>
              </div>

              <div>
                <LockKeyhole size={20} />

                <span>
                  Protected order history
                </span>
              </div>

            </div>

          </div>


          <div className="signup-food-visual">
            🍕
          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="signup-form-section">

          <div className="signup-form-wrapper">

            <div className="signup-heading">

              <span>
                CREATE ACCOUNT
              </span>

              <h2>
                Get started
              </h2>

              <p>
                Create your BiteRush account in a few
                simple steps.
              </p>

            </div>


            <form
              className="signup-form"
              onSubmit={handleSubmit}
            >

              {/* FULL NAME */}

              <div className="signup-field">

                <label>
                  Full name
                </label>

                <div className="signup-input">

                  <User size={18} />

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="signup-field">

                <label>
                  Email address
                </label>

                <div className="signup-input">

                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="signup-field">

                <label>
                  Password
                </label>

                <div className="signup-input">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="signup-field">

                <label>
                  Confirm password
                </label>

                <div className="signup-input">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="signup-error">
                  {error}
                </div>
              )}


              {/* SUCCESS */}

              {success && (
                <div className="signup-success">
                  {success}
                </div>
              )}


              {/* SUBMIT */}

              <button
                className="signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>


            <div className="signup-login">

              <span>
                Already have an account?
              </span>

              <Link to="/signin">
                Sign in
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default SignUp;