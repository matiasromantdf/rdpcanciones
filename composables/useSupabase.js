import { ref } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';

export const useSupabase = () => {
  const supabase = useSupabaseClient();  // Accede al cliente de Supabase
  const usuario = useSupabaseUser();        // Información del usuario actual
  const roles = ref(null);               // Almacena los roles del usuario
  const errorMessage = ref(null);        // Para capturar errores

  // Iniciar sesión
//   const signIn = async (email, password) => {
//     try {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) throw error;
//       await fetchUserRoles();
//     } catch (error) {
//       errorMessage.value = error.message;
//     }
//   };

  // Cerrar sesión
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

  // Obtener roles del usuario autenticado
  const fetchUserRoles = async () => {
    if(!usuario.value) return []; // Si el usuario no está autenticado, no hagas nada
    try {
      const { data, error } = await supabase
        .from('roles_usuarios') // Asegúrate de que este sea el nombre correcto de tu tabla
        .select('rol')
        .eq('user_id', usuario.value.id); // user.value.id contiene el ID del usuario autenticado
      if (error) throw error;
      roles.value = data;
    } catch (error) {
      errorMessage.value = error.message;
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = async (role) => {
    if(usuario.value){
      await fetchUserRoles(); // Asegúrate de que los roles estén disponibles
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
  };
};
