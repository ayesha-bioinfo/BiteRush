import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(
        email.trim(),
        password
      );

      navigate("/");
    } catch (error) {
      setError(
        error.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signin-page">

      <div className="signin-container">

        {/* LEFT SIDE */}

        <section className="signin-showcase">

          <div className="signin-showcase-content">

            <span className="signin-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Your next meal is
              <span> closer than you think.</span>
            </h1>

            <p>
              Sign in to BiteRush to manage your
              orders, discover restaurants and
              enjoy a faster checkout experience.
            </p>

            <div className="signin-benefits">

              <div>
                <ShieldCheck size={20} />

                <span>
                  Secure account access
                </span>
              </div>

              <div>
                <LockKeyhole size={20} />

                <span>
                  Protected authentication
                </span>
              </div>

            </div>

          </div>

          <div className="signin-food-visual">
            🍔
          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="signin-form-section">

          <div className="signin-form-wrapper">

            <div className="signin-heading">

              <span>
                SIGN IN
              </span>

              <h2>
                Welcome back
              </h2>

              <p>
                Enter your account details
                to continue.
              </p>

            </div>


            <form
              className="signin-form"
              onSubmit={handleSubmit}
            >

              <div className="signin-field">

                <label>
                  Email address
                </label>

                <div className="signin-input">

                  <Mail size={18} />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>


              <div className="signin-field">

                <label>
                  Password
                </label>

                <div className="signin-input">

                  <LockKeyhole size={18} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
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


              {error && (
                <div className="signin-error">
                  {error}
                </div>
              )}


              <button
                className="signin-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>


            <div className="signin-register">

              <span>
                New to BiteRush?
              </span>

              <Link to="/signup">
                Create an account
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default SignIn;