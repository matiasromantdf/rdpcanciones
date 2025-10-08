-- Crear tabla de mensajes de servicio
CREATE TABLE IF NOT EXISTS mensajes_servicio (
    id BIGSERIAL PRIMARY KEY,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo_mensaje VARCHAR(20) DEFAULT 'mensaje' CHECK (tipo_mensaje IN ('mensaje', 'sistema', 'info')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de participantes online en servicios
CREATE TABLE IF NOT EXISTS participantes_online_servicio (
    id BIGSERIAL PRIMARY KEY,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(servicio_id, user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mensajes_servicio_servicio_id ON mensajes_servicio(servicio_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_servicio_created_at ON mensajes_servicio(created_at);
CREATE INDEX IF NOT EXISTS idx_participantes_online_servicio_servicio_id ON participantes_online_servicio(servicio_id);
CREATE INDEX IF NOT EXISTS idx_participantes_online_servicio_last_seen ON participantes_online_servicio(last_seen);

-- Función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_mensajes_servicio_updated_at 
    BEFORE UPDATE ON mensajes_servicio 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participantes_online_servicio_updated_at 
    BEFORE UPDATE ON participantes_online_servicio 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) para mensajes_servicio
ALTER TABLE mensajes_servicio ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver mensajes de servicios donde están asignados
CREATE POLICY "Users can view messages of services they are assigned to" ON mensajes_servicio
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM servicios_usuarios su 
            WHERE su.servicio_id = mensajes_servicio.servicio_id 
            AND su.user_id = auth.uid()
        )
    );

-- Los usuarios pueden insertar mensajes en servicios donde están asignados
CREATE POLICY "Users can insert messages in services they are assigned to" ON mensajes_servicio
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM servicios_usuarios su 
            WHERE su.servicio_id = servicio_id 
            AND su.user_id = auth.uid()
        )
    );

-- Los usuarios solo pueden editar sus propios mensajes
CREATE POLICY "Users can update their own messages in services" ON mensajes_servicio
    FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propios mensajes
CREATE POLICY "Users can delete their own messages in services" ON mensajes_servicio
    FOR DELETE USING (user_id = auth.uid());

-- Políticas RLS para participantes_online_servicio
ALTER TABLE participantes_online_servicio ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver participantes online de servicios donde están asignados
CREATE POLICY "Users can view online participants of services they are assigned to" ON participantes_online_servicio
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM servicios_usuarios su 
            WHERE su.servicio_id = participantes_online_servicio.servicio_id 
            AND su.user_id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar su propia presencia online
CREATE POLICY "Users can upsert their own online presence in services" ON participantes_online_servicio
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own online presence in services" ON participantes_online_servicio
    FOR UPDATE USING (user_id = auth.uid());

-- Comentarios para documentar las tablas
COMMENT ON TABLE mensajes_servicio IS 'Tabla para almacenar mensajes del chat de servicios musicales';
COMMENT ON COLUMN mensajes_servicio.tipo_mensaje IS 'Tipo de mensaje: mensaje (normal), sistema (notificaciones automáticas), info (información)';

COMMENT ON TABLE participantes_online_servicio IS 'Tabla para rastrear qué usuarios están online en cada servicio';
COMMENT ON COLUMN participantes_online_servicio.last_seen IS 'Última vez que el usuario estuvo activo en el servicio';

-- Habilitar Realtime para las tablas del chat de servicios
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes_servicio;
ALTER PUBLICATION supabase_realtime ADD TABLE participantes_online_servicio;