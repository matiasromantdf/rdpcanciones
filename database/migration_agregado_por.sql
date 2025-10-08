-- Migración para agregar columna agregado_por a servicios_canciones
-- Ejecutar este script si la tabla servicios_canciones ya existe sin la columna agregado_por

-- Agregar la columna agregado_por si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'servicios_canciones' 
        AND column_name = 'agregado_por'
    ) THEN
        ALTER TABLE servicios_canciones 
        ADD COLUMN agregado_por UUID REFERENCES usuarios(id) ON DELETE CASCADE;
        
        -- Crear índice para la nueva columna
        CREATE INDEX IF NOT EXISTS idx_servicios_canciones_agregado_por ON servicios_canciones(agregado_por);
        
        -- Agregar comentario para la nueva columna
        COMMENT ON COLUMN servicios_canciones.agregado_por IS 'ID del usuario que agregó la canción al servicio';
        
        RAISE NOTICE 'Columna agregado_por agregada exitosamente a servicios_canciones';
    ELSE
        RAISE NOTICE 'La columna agregado_por ya existe en servicios_canciones';
    END IF;
END $$;