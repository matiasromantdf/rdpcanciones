/**
 * Composable para ejecutar scripts SQL en Supabase
 */
export const useSupabaseAdmin = () => {
    const supabase = useSupabaseClient()

    const ejecutarSQL = async (sql: string) => {
        try {
            const { data, error } = await supabase.rpc('ejecutar_sql_admin', { 
                sql_query: sql 
            })
            
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('Error ejecutando SQL:', error)
            return { data: null, error }
        }
    }

    const crearTablasMensajes = async () => {
        const queries = [
            // Crear tabla de mensajes de reunión
            `CREATE TABLE IF NOT EXISTS mensajes_reunion (
                id BIGSERIAL PRIMARY KEY,
                convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                mensaje TEXT NOT NULL,
                tipo_mensaje VARCHAR(20) DEFAULT 'mensaje' CHECK (tipo_mensaje IN ('mensaje', 'sistema', 'info')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );`,
            
            // Crear tabla de participantes online
            `CREATE TABLE IF NOT EXISTS participantes_online (
                id BIGSERIAL PRIMARY KEY,
                convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                is_online BOOLEAN DEFAULT true,
                last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(convocatoria_id, user_id)
            );`,
            
            // Índices
            `CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_convocatoria_id ON mensajes_reunion(convocatoria_id);`,
            `CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_created_at ON mensajes_reunion(created_at);`,
            `CREATE INDEX IF NOT EXISTS idx_participantes_online_convocatoria_id ON participantes_online(convocatoria_id);`,
            `CREATE INDEX IF NOT EXISTS idx_participantes_online_last_seen ON participantes_online(last_seen);`
        ]

        for (const query of queries) {
            const { error } = await ejecutarSQL(query)
            if (error) {
                console.error('Error creando tabla:', error)
                return { success: false, error }
            }
        }

        return { success: true, error: null }
    }

    const configurarRLS = async () => {
        const rlsQueries = [
            // Habilitar RLS para mensajes_reunion
            `ALTER TABLE mensajes_reunion ENABLE ROW LEVEL SECURITY;`,
            
            // Política para ver mensajes
            `CREATE POLICY IF NOT EXISTS "Users can view messages of meetings they are invited to" ON mensajes_reunion
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM convocatorias_users cu 
                        WHERE cu.convocatoria_id = mensajes_reunion.convocatoria_id 
                        AND cu.user_id = auth.uid()
                    )
                );`,
            
            // Política para insertar mensajes
            `CREATE POLICY IF NOT EXISTS "Users can insert messages in meetings they are invited to" ON mensajes_reunion
                FOR INSERT WITH CHECK (
                    user_id = auth.uid() AND
                    EXISTS (
                        SELECT 1 FROM convocatorias_users cu 
                        WHERE cu.convocatoria_id = mensajes_reunion.convocatoria_id 
                        AND cu.user_id = auth.uid()
                    )
                );`,
            
            // Política para actualizar mensajes propios
            `CREATE POLICY IF NOT EXISTS "Users can update their own messages" ON mensajes_reunion
                FOR UPDATE USING (user_id = auth.uid());`,
            
            // Habilitar RLS para participantes_online
            `ALTER TABLE participantes_online ENABLE ROW LEVEL SECURITY;`,
            
            // Política para ver participantes online
            `CREATE POLICY IF NOT EXISTS "Users can view online participants of meetings they are invited to" ON participantes_online
                FOR SELECT USING (
                    EXISTS (
                        SELECT 1 FROM convocatorias_users cu 
                        WHERE cu.convocatoria_id = participantes_online.convocatoria_id 
                        AND cu.user_id = auth.uid()
                    )
                );`,
            
            // Política para insertar presencia
            `CREATE POLICY IF NOT EXISTS "Users can upsert their own online presence" ON participantes_online
                FOR INSERT WITH CHECK (user_id = auth.uid());`,
            
            // Política para actualizar presencia
            `CREATE POLICY IF NOT EXISTS "Users can update their own online presence" ON participantes_online
                FOR UPDATE USING (user_id = auth.uid());`
        ]

        for (const query of rlsQueries) {
            const { error } = await ejecutarSQL(query)
            if (error) {
                console.error('Error configurando RLS:', error)
                return { success: false, error }
            }
        }

        return { success: true, error: null }
    }

    return {
        ejecutarSQL,
        crearTablasMensajes,
        configurarRLS
    }
}