import { cn } from '@/utils/cn';

export const StarBorder = ({
    as: Component = 'div',
    className,
    containerClassName,
    color = 'var(--color-marca-primario)', // Conectado a nuestro Diccionario
    speed = '6s',
    thickness = 1.5,
    children,
    ...props
}) => {
    return (
        <Component
            className={cn(
                "relative inline-block overflow-hidden rounded-2xl shadow-sm",
                containerClassName
            )}
            style={{ padding: `${thickness}px` }}
            {...props}
        >
            {/* Inyección de animaciones aisladas (Evitamos ensuciar el index.css global) */}
            <style>{`
                @keyframes star-movement-bottom {
                    0% { transform: translate(0%, 0%); opacity: 1; }
                    100% { transform: translate(-100%, 0%); opacity: 0; }
                }
                @keyframes star-movement-top {
                    0% { transform: translate(0%, 0%); opacity: 1; }
                    100% { transform: translate(100%, 0%); opacity: 0; }
                }
            `}</style>

            {/* Capa de Efecto: Gradiente Inferior */}
            <div
                className="absolute w-[300%] h-[50%] opacity-70 bottom-[-12px] right-[-250%] rounded-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${color}, transparent 10%)`,
                    animation: `star-movement-bottom ${speed} linear infinite alternate`
                }}
            />

            {/* Capa de Efecto: Gradiente Superior */}
            <div
                className="absolute w-[300%] h-[50%] opacity-70 top-[-12px] left-[-250%] rounded-full z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${color}, transparent 10%)`,
                    animation: `star-movement-top ${speed} linear infinite alternate`
                }}
            />

            {/* Máscara de Contenido (Clean UI) */}
            <div className={cn(
                "relative z-10 bg-white w-full h-full rounded-[14px]", // Radio calculado: 16px (2xl) - 1.5px (borde)
                className
            )}>
                {children}
            </div>
        </Component>
    );
};