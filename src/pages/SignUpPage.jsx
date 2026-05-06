import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router-dom";
import signupImage from "../assets/signup.png"
function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" , username: ""});
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 ">
      <div className="relative w-full max-w-6xl mx-auto md:h-[800px] h-[650px] ">
        <BorderAnimatedContainer className="w-full h-full">
          
          <div className="w-full h-full flex flex-col md:flex-row bg-white-50">
            
            {/* LADO IZQUIERDO - FORMULARIO */}
            <div className="flex-1 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                
                {/* ENCABEZADO */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Crear cuenta</h2>
                  <p className="text-slate-400">Regístrate para una nueva cuenta</p>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* NOMBRE */}
                  <div>
                    <label className="auth-input-label">Nombre completo</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input"
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>
    {/* USUARIO */}
                  <div>
                    <label className="auth-input-label">Nombre de usuario</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="input"
                        placeholder="user.."
                      />
                    </div>
                  </div>
                  {/* EMAIL */}
                  <div>
                    <label className="auth-input-label">Correo electrónico</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="ejemplo@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="auth-input-label">Contraseña</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Ingresa tu contraseña"
                      />
                    </div>
                  </div>

                  {/* BOTÓN */}
                  <button className="auth-btn" type="submit" disabled={isSigningUp}>
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Crear cuenta"
                    )}
                  </button>
                </form>

                {/* LINK */}
                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    ¿Ya tienes una cuenta? Inicia sesión
                  </Link>
                </div>
              </div>
            </div>

            {/* LADO DERECHO */}
            <div className="hidden md:flex flex-1 items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src={signupImage}
                  alt="Personas usando dispositivos móviles"
                  className="w-full h-auto object-contain"
                />

                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Comienza tu experiencia hoy
                  </h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Gratis</span>
                    <span className="auth-badge">Fácil de usar</span>
                    <span className="auth-badge">Privado</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage;