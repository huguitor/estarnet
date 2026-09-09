import { Link } from 'react-router-dom'
import {
    IconArrowRight,
    IconChat,
    IconCheck,
    IconChip,
    IconCode,
    IconPlug,
    IconServer,
    IconShield,
} from '../components/Icons'

/* ---------- Primitivas del diagrama ---------- */

function Box({ children, tone = 'plain', className = '' }) {
    const tones = {
        plain: 'border-slate-200 bg-white text-slate-700',
        muted: 'border-slate-200 bg-slate-50 text-slate-600',
        dark: 'border-brand bg-brand text-white',
        accent: 'border-accent bg-accent/5 text-accent',
    }
    return (
        <div className={`rounded-lg border px-3 py-2 text-center text-sm font-medium ${tones[tone]} ${className}`}>
            {children}
        </div>
    )
}

function Down() {
    return (
        <div className="flex flex-col items-center py-0.5 text-slate-400" aria-hidden="true">
            <span className="h-3 w-px bg-slate-300" />
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
        </div>
    )
}

function Fork({ children }) {
    return <div className="grid w-full grid-cols-2 gap-2">{children}</div>
}

function Row3({ children }) {
    return <div className="grid w-full grid-cols-3 gap-2">{children}</div>
}

function Converge() {
    return (
        <div className="flex justify-center" aria-hidden="true">
            <div className="h-3 w-2/3 border-x-2 border-b-2 border-slate-300" />
        </div>
    )
}

function DiagramPanel({ children }) {
    return <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">{children}</div>
}

/* ---------- Mapa general ---------- */

function MapNode({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-center text-xs font-medium text-slate-700">{label}</span>
        </div>
    )
}

function SystemMap() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center py-4">
            <Box tone="dark" className="px-4 py-2.5">
                Tu operación
            </Box>
            <Down />
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
                <MapNode icon={IconCode} label="Software" />
                <MapNode icon={IconServer} label="Infraestructura" />
                <MapNode icon={IconChip} label="Dispositivos" />
            </div>
            <Converge />
            <Down />
            <Box tone="accent" className="px-4 py-2.5">
                Todo conectado
            </Box>
            <Down />
            <Box tone="dark" className="px-4 py-2.5">
                Información + control
            </Box>
        </div>
    )
}

/* ---------- Gráficos de cada solución ---------- */

function SoftwareDiagram() {
    return (
        <div className="flex flex-col items-center py-2">
            <Box tone="dark" className="px-4">
                Gestión
            </Box>
            <Down />
            <Row3>
                <Box>Ventas</Box>
                <Box>Stock</Box>
                <Box>Compras</Box>
            </Row3>
            <p className="mt-2 text-center text-[11px] text-slate-500">comparten información</p>
            <Down />
            <Box tone="accent" className="px-4">
                Reportes
            </Box>
        </div>
    )
}

function InfraDiagram() {
    return (
        <div className="flex flex-col items-center py-2">
            <Box tone="muted">Conectividad</Box>
            <Down />
            <Box tone="muted">Red</Box>
            <Down />
            <Box tone="dark" className="px-4">
                Servidor
            </Box>
            <Down />
            <Fork>
                <Box>Sistemas</Box>
                <Box>Backup</Box>
            </Fork>
            <Converge />
            <Down />
            <Box tone="accent" className="px-4">
                Usuarios
            </Box>
        </div>
    )
}

function IotDiagram() {
    return (
        <div className="flex flex-col items-center py-2">
            <Box tone="muted">Sensor / Dispositivo</Box>
            <Down />
            <Box tone="dark" className="px-4">
                Plataforma
            </Box>
            <Down />
            <Fork>
                <Box>Evento</Box>
                <Box>Historial</Box>
            </Fork>
            <Converge />
            <Down />
            <Box tone="accent" className="px-4">
                Alerta / Acción
            </Box>
        </div>
    )
}

function AccesoDiagram() {
    return (
        <div className="flex flex-col items-center py-2">
            <Box tone="muted">Credencial</Box>
            <Down />
            <Box tone="muted">Lector</Box>
            <Down />
            <Box tone="dark" className="px-4">
                Control
            </Box>
            <Down />
            <Fork>
                <Box>Puerta</Box>
                <Box>Registro</Box>
            </Fork>
            <Converge />
            <Down />
            <Box tone="accent" className="px-4">
                Supervisión
            </Box>
        </div>
    )
}

function IntegraDiagram() {
    return (
        <div className="flex flex-col items-center py-2">
            <Row3>
                <Box>Sistema A</Box>
                <Box>Sistema B</Box>
                <Box>Servicio</Box>
            </Row3>
            <p className="mt-2 text-center text-[11px] text-slate-500">hoy trabajan separados</p>
            <Converge />
            <Down />
            <Box tone="dark" className="px-4">
                Integración
            </Box>
            <Down />
            <Box tone="accent" className="px-4">
                Información compartida
            </Box>
        </div>
    )
}

function ConsultoriaDiagram() {
    const steps = ['Problema', 'Relevamiento', 'Diseño', 'Implementación', 'Acompañamiento']
    return (
        <div className="py-2">
            {steps.map((s, i) => (
                <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === steps.length - 1 ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                                }`}
                        >
                            {i + 1}
                        </span>
                        {i < steps.length - 1 && <span className="h-4 w-px bg-slate-300" />}
                    </div>
                    <span
                        className={`pt-1 text-sm ${i === steps.length - 1 ? 'font-semibold text-brand' : 'font-medium text-slate-700'
                            }`}
                    >
                        {s}
                    </span>
                </div>
            ))}
        </div>
    )
}

/* ---------- Datos ---------- */

const solutions = {
    software: {
        id: 'software',
        icon: IconCode,
        title: 'Software a medida y sistemas de gestión',
        text: 'Centralizamos procesos que hoy funcionan con planillas, papeles o sistemas separados.',
        caps: ['Administración', 'Comercial', 'Compras', 'Stock', 'Pedidos', 'Reportes'],
        result: 'Una plataforma adaptada al funcionamiento real de la organización.',
        diagram: <SoftwareDiagram />,
    },
    integraciones: {
        id: 'integraciones',
        icon: IconPlug,
        title: 'Integraciones y servicios conectados',
        text: 'Conectamos sistemas que hoy trabajan separados para reducir tareas manuales.',
        caps: ['Sistemas existentes', 'Plataformas web', 'Servicios externos', 'Automatización'],
        result: 'Información fluyendo entre plataformas, sin carga manual repetida.',
        diagram: <IntegraDiagram />,
    },
    infraestructura: {
        id: 'infraestructura',
        icon: IconServer,
        title: 'Infraestructura tecnológica',
        text: 'La base sobre la que funcionan los sistemas y los usuarios, disponible y respaldada.',
        caps: ['Servidores', 'Redes', 'Conectividad', 'Cloud', 'Backups'],
        result: 'Operación disponible y preparada para crecer.',
        diagram: <InfraDiagram />,
    },
    iot: {
        id: 'iot',
        icon: IconChip,
        title: 'IoT y automatización',
        text: 'Conectamos dispositivos y sensores para que lo que ocurre en el mundo físico llegue al sistema.',
        caps: ['Sensores', 'Telemetría', 'Monitoreo', 'Alertas'],
        result: 'Información en tiempo real y acciones automáticas.',
        diagram: <IotDiagram />,
    },
    'control-acceso': {
        id: 'control-acceso',
        icon: IconShield,
        title: 'Control de acceso y seguridad',
        text: 'Administramos accesos y centralizamos los eventos de forma trazable.',
        caps: ['Lectores', 'Credenciales', 'Sensores', 'Supervisión'],
        result: 'Accesos y eventos centralizados, con registro de lo que ocurre.',
        diagram: <AccesoDiagram />,
    },
    consultoria: {
        id: 'consultoria',
        icon: IconChat,
        title: 'Consultoría tecnológica',
        text: 'Antes de proponer tecnología, entendemos el proceso y el problema.',
        caps: ['Relevamiento', 'Análisis', 'Diseño de solución', 'Planificación'],
        result: 'El camino adecuado, definido antes de invertir.',
        diagram: <ConsultoriaDiagram />,
    },
}

const groups = [
    {
        id: 'gestionar',
        number: '01',
        title: 'Gestionar la operación',
        concept: 'Ordenar procesos e información y conectar sistemas que hoy trabajan separados.',
        solutions: [solutions.software, solutions.integraciones],
    },
    {
        id: 'conectar',
        number: '02',
        title: 'Conectar la operación',
        concept:
            'Conectar sistemas, infraestructura y mundo físico para que la operación funcione, informe y reaccione.',
        solutions: [solutions.infraestructura, solutions.iot, solutions['control-acceso']],
    },
    {
        id: 'definir',
        number: '03',
        title: 'Definir el camino',
        concept: 'Entender primero el problema y definir qué implementar, en qué orden y con qué alcance.',
        solutions: [solutions.consultoria],
    },
]

const heroNav = [
    { href: '#software', label: 'Software' },
    { href: '#infraestructura', label: 'Infraestructura' },
    { href: '#iot', label: 'IoT' },
    { href: '#control-acceso', label: 'Accesos' },
    { href: '#integraciones', label: 'Integraciones' },
    { href: '#consultoria', label: 'Consultoría' },
]

const useCases = [
    'Gestión administrativa y comercial',
    'Compras y proveedores',
    'Stock',
    'Procesos internos',
    'Monitoreo',
    'Control de accesos',
    'Comunicación',
    'Integración entre sistemas',
]

/* ---------- Componentes de render ---------- */

function SolutionBlock({ s, flip }) {
    return (
        <article id={s.id} className="scroll-mt-24">
            <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className={flip ? 'lg:order-2' : ''}>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <s.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">{s.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{s.text}</p>
                    <p className="mt-3 text-sm text-slate-500">{s.caps.join(' · ')}</p>
                    <p className="mt-4 flex items-start gap-2 text-sm font-medium text-slate-700">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {s.result}
                    </p>
                </div>
                <div className={flip ? 'lg:order-1' : ''}>
                    <DiagramPanel>{s.diagram}</DiagramPanel>
                </div>
            </div>
        </article>
    )
}

export default function Soluciones() {
    return (
        <div className="overflow-x-hidden">
            {/* ============ HERO ============ */}
            <section className="bg-gradient-to-b from-sky-50 via-white to-white">
                <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                            Soluciones
                        </p>
                        <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                            Tecnología aplicada a las necesidades reales de tu operación.
                        </h1>
                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Combinamos software, infraestructura y soluciones conectadas para resolver
                            procesos concretos e integrar áreas.
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark"
                            >
                                Hablemos de tu proyecto
                                <IconArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <nav
                        className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-sm"
                        aria-label="Soluciones de la página"
                    >
                        {heroNav.map((n) => (
                            <a
                                key={n.href}
                                href={n.href}
                                className="font-medium text-slate-500 transition hover:text-brand"
                            >
                                {n.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            {/* ============ MAPA VISUAL ============ */}
            <section className="bg-slate-50 py-14 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Tecnología que trabaja como un sistema
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Software, infraestructura y dispositivos dejan de ser piezas separadas cuando
                            comparten información y forman parte de la misma operación.
                        </p>
                    </div>
                    <div className="mt-10">
                        <SystemMap />
                    </div>
                </div>
            </section>

            {/* ============ GRUPOS ============ */}
            {groups.map((group, gi) => (
                <section key={group.id} className={gi % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
                        <div className="mb-12">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                                {group.number}
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {group.title}
                            </h2>
                            <p className="mt-3 max-w-2xl text-lg text-slate-600">{group.concept}</p>
                        </div>
                        <div className="space-y-14">
                            {group.solutions.map((s, si) => (
                                <SolutionBlock key={s.id} s={s} flip={si % 2 === 1} />
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* ============ DÓNDE APLICAMOS ============ */}
            <section className="bg-slate-50 py-14 sm:py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                            Aplicación
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Dónde aplicamos estas soluciones
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Distintas necesidades pueden resolverse combinando una o varias de nuestras
                            capacidades.
                        </p>
                    </div>
                    <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                        {useCases.map((useCase) => (
                            <li key={useCase} className="flex items-center gap-2 text-sm text-slate-700">
                                <IconCheck className="h-4 w-4 shrink-0 text-primary" />
                                {useCase}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ============ CTA FINAL ============ */}
            <section className="bg-brand-dark py-16 sm:py-20">
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        La tecnología correcta empieza por entender el problema.
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
                        Contanos cómo trabaja tu empresa y qué necesitás mejorar. Podemos ayudarte a
                        definir una solución adecuada.
                    </p>
                    <div className="mt-8">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand shadow-sm transition hover:bg-slate-100"
                        >
                            Hablemos de tu proyecto
                            <IconArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
