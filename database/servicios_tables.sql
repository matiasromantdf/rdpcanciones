-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    detalles TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de participantes de servicios
CREATE TABLE IF NOT EXISTS servicios_usuarios (
    id BIGSERIAL PRIMARY KEY,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(servicio_id, user_id)
);

-- Crear tabla de repertorio de servicios (canciones por servicio)
CREATE TABLE IF NOT EXISTS servicios_canciones (
    id BIGSERIAL PRIMARY KEY,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    cancion_id BIGINT NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    agregado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 1,
    tono VARCHAR(10),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(servicio_id, cancion_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios(fecha);
CREATE INDEX IF NOT EXISTS idx_servicios_created_at ON servicios(created_at);
CREATE INDEX IF NOT EXISTS idx_servicios_usuarios_servicio_id ON servicios_usuarios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_servicios_usuarios_user_id ON servicios_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_servicios_canciones_servicio_id ON servicios_canciones(servicio_id);
CREATE INDEX IF NOT EXISTS idx_servicios_canciones_cancion_id ON servicios_canciones(cancion_id);
CREATE INDEX IF NOT EXISTS idx_servicios_canciones_agregado_por ON servicios_canciones(agregado_por);
CREATE INDEX IF NOT EXISTS idx_servicios_canciones_orden ON servicios_canciones(orden);

-- Función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_servicios_updated_at 
    BEFORE UPDATE ON servicios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_usuarios_updated_at 
    BEFORE UPDATE ON servicios_usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_canciones_updated_at 
    BEFORE UPDATE ON servicios_canciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) para servicios
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Los usuarios con rol admin_voces pueden ver todos los servicios
CREATE POLICY "Admin voces can view all services" ON servicios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Los usuarios pueden ver servicios donde están asignados
CREATE POLICY "Users can view services they are assigned to" ON servicios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM servicios_usuarios su 
            WHERE su.servicio_id = servicios.id 
            AND su.user_id = auth.uid()
        )
    );

-- Solo admin_voces puede crear servicios
CREATE POLICY "Only admin voces can insert services" ON servicios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Solo admin_voces puede actualizar servicios
CREATE POLICY "Only admin voces can update services" ON servicios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Solo admin_voces puede eliminar servicios
CREATE POLICY "Only admin voces can delete services" ON servicios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Políticas RLS para servicios_usuarios
ALTER TABLE servicios_usuarios ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver participantes de servicios donde están asignados o si son admin_voces
CREATE POLICY "Users can view service participants they have access to" ON servicios_usuarios
    FOR SELECT USING (
        -- Si es admin_voces, puede ver todo
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
        OR
        -- Si está asignado al servicio, puede ver los participantes
        EXISTS (
            SELECT 1 FROM servicios_usuarios su2 
            WHERE su2.servicio_id = servicios_usuarios.servicio_id 
            AND su2.user_id = auth.uid()
        )
    );

-- Solo admin_voces puede gestionar participantes de servicios
CREATE POLICY "Only admin voces can manage service participants" ON servicios_usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Políticas RLS para servicios_canciones
ALTER TABLE servicios_canciones ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver repertorio de servicios donde están asignados o si son admin_voces
CREATE POLICY "Users can view service repertoire they have access to" ON servicios_canciones
    FOR SELECT USING (
        -- Si es admin_voces, puede ver todo
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
        OR
        -- Si está asignado al servicio, puede ver el repertorio
        EXISTS (
            SELECT 1 FROM servicios_usuarios su 
            WHERE su.servicio_id = servicios_canciones.servicio_id 
            AND su.user_id = auth.uid()
        )
    );

-- Solo admin_voces puede gestionar repertorio de servicios
CREATE POLICY "Only admin voces can manage service repertoire" ON servicios_canciones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles_usuarios ru 
            JOIN roles r ON ru.rol_id = r.id 
            WHERE ru.user_id = auth.uid() 
            AND r.rol = 'admin_voces'
        )
    );

-- Comentarios para documentar las tablas
COMMENT ON TABLE servicios IS 'Tabla para almacenar servicios musicales (cultos, conciertos, etc.)';
COMMENT ON COLUMN servicios.titulo IS 'Título descriptivo del servicio';
COMMENT ON COLUMN servicios.fecha IS 'Fecha del servicio';
COMMENT ON COLUMN servicios.hora IS 'Hora de inicio del servicio';
COMMENT ON COLUMN servicios.detalles IS 'Información adicional sobre el servicio';

COMMENT ON TABLE servicios_usuarios IS 'Tabla para relacionar usuarios (integrantes) con servicios';
COMMENT ON COLUMN servicios_usuarios.servicio_id IS 'ID del servicio';
COMMENT ON COLUMN servicios_usuarios.user_id IS 'ID del usuario participante';

COMMENT ON TABLE servicios_canciones IS 'Tabla para el repertorio de cada servicio';
COMMENT ON COLUMN servicios_canciones.servicio_id IS 'ID del servicio';
COMMENT ON COLUMN servicios_canciones.cancion_id IS 'ID de la canción';
COMMENT ON COLUMN servicios_canciones.agregado_por IS 'ID del usuario que agregó la canción al servicio';
COMMENT ON COLUMN servicios_canciones.orden IS 'Orden de la canción en el servicio';
COMMENT ON COLUMN servicios_canciones.tono IS 'Tono en que se tocará la canción';
COMMENT ON COLUMN servicios_canciones.observaciones IS 'Notas especiales sobre la canción en este servicio';

-- Habilitar Realtime para las tablas de servicios (opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE servicios;
ALTER PUBLICATION supabase_realtime ADD TABLE servicios_usuarios;
ALTER PUBLICATION supabase_realtime ADD TABLE servicios_canciones;