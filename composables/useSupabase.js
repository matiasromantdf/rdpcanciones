import { ref } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';

export const useSupabase = () => {
  const supabase = useSupabaseClient();  
  const usuario = useSupabaseUser();     
  const roles = ref(null);               
  const errorMessage = ref(null);     

  const signIn = async () => {
    let url = new URL(window.location.href);
    localStorage.setItem('originUrl', url)
    const { user, session, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    })

    if (error) {
        console.error('Error al iniciar sesión:', error.message)
    } else {
        console.log('Usuario:', user)
        console.log('Sesión:', session)
    }
  };


  // Cerrar sesión
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Limpiar los roles del usuario
      roles.value = null;
      if (error) throw error;
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

  // Obtener roles del usuario autenticado
  const fetchUserRoles = async () => {
    if(!usuario.value) return []; 
    try {
      const { data, error } = await supabase
        .from('roles_usuarios')
        .select('rol')
        .eq('user_id', usuario.value.id); 
      if (error) throw error;
      roles.value = data;
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = async (role) => {
    if(usuario.value){
      await fetchUserRoles(); 
      return roles.value.some((r) => r.rol === role);
    }
    return false;
  };

  // Registrar usuario
  const signUp = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

  

  return {
    usuario,               // El usuario actual
    roles,              // Los roles asociados al usuario
    errorMessage,       // Posibles errores
    signOut,            // Función para cerrar sesión
    signUp,             // Función para registrar un nuevo usuario
    hasRole,            // Verifica si el usuario tiene un rol específico
    supabase,           // Cliente de Supabase
    signIn,             // Función para iniciar sesión
  };
};
