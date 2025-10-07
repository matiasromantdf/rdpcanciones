-- Crear tabla de mensajes de reunión
CREATE TABLE IF NOT EXISTS mensajes_reunion (
    id BIGSERIAL PRIMARY KEY,
    convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo_mensaje VARCHAR(20) DEFAULT 'mensaje' CHECK (tipo_mensaje IN ('mensaje', 'sistema', 'info')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de participantes online
CREATE TABLE IF NOT EXISTS participantes_online (
    id BIGSERIAL PRIMARY KEY,
    convocatoria_id BIGINT NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(convocatoria_id, user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_convocatoria_id ON mensajes_reunion(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_reunion_created_at ON mensajes_reunion(created_at);
CREATE INDEX IF NOT EXISTS idx_participantes_online_convocatoria_id ON participantes_online(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_participantes_online_last_seen ON participantes_online(last_seen);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_mensajes_reunion_updated_at 
    BEFORE UPDATE ON mensajes_reunion 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participantes_online_updated_at 
    BEFORE UPDATE ON participantes_online 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) para mensajes_reunion
ALTER TABLE mensajes_reunion ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver mensajes de reuniones donde están convocados
CREATE POLICY "Users can view messages of meetings they are invited to" ON mensajes_reunion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = mensajes_reunion.convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

-- Los usuarios pueden insertar mensajes en reuniones donde están convocados
CREATE POLICY "Users can insert messages in meetings they are invited to" ON mensajes_reunion
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

-- Los usuarios solo pueden editar sus propios mensajes
CREATE POLICY "Users can update their own messages" ON mensajes_reunion
    FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propios mensajes
CREATE POLICY "Users can delete their own messages" ON mensajes_reunion
    FOR DELETE USING (user_id = auth.uid());

-- Políticas RLS para participantes_online
ALTER TABLE participantes_online ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver participantes online de reuniones donde están convocados
CREATE POLICY "Users can view online participants of meetings they are invited to" ON participantes_online
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM convocatorias_users cu 
            WHERE cu.convocatoria_id = participantes_online.convocatoria_id 
            AND cu.user_id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar su propia presencia online
CREATE POLICY "Users can upsert their own online presence" ON participantes_online
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own online presence" ON participantes_online
    FOR UPDATE USING (user_id = auth.uid());

-- Comentarios para documentar las tablas
COMMENT ON TABLE mensajes_reunion IS 'Tabla para almacenar mensajes del chat de reuniones';
COMMENT ON COLUMN mensajes_reunion.tipo_mensaje IS 'Tipo de mensaje: mensaje (normal), sistema (notificaciones automáticas), info (información)';

COMMENT ON TABLE participantes_online IS 'Tabla para rastrear qué usuarios están online en cada reunión';
COMMENT ON COLUMN participantes_online.last_seen IS 'Última vez que el usuario estuvo activo en la reunión';

-- Habilitar Realtime para las tablas del chat
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes_reunion;
ALTER PUBLICATION supabase_realtime ADD TABLE participantes_online;