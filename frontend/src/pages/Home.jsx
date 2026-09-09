import { Link } from 'react-router-dom'
import ContactForm from '../components/ContactForm'
import {
  IconArrowRight,
  IconChat,
  IconCheck,
  IconChip,
  IconCode,
  IconLayout,
  IconPlug,
  IconSearch,
  IconServer,
  IconShield,
  IconSliders,
  IconUsers,
} from '../components/Icons'

const services = [
  {
    icon: IconCode,
    title: 'Software a medida y gestión',
    text: 'Sistemas administrativos, comerciales y operativos adaptados al funcionamiento real de cada organización.',
  },
  {
    icon: IconServer,
    title: 'Infraestructura tecnológica',
    text: 'Servidores, redes, conectividad, servicios y arquitectura para mantener la operación disponible.',
  },
  {
    icon: IconChip,
    title: 'IoT y automatización',
    text: 'Dispositivos conectados, telemetría, monitoreo, eventos y automatización de procesos.',
  },
  {
    icon: IconShield,
    title: 'Control de acceso y seguridad',
    text: 'Control de acceso, lectores, sensores, eventos, supervisión e integración con plataformas centrales.',
  },
  {
    icon: IconPlug,
    title: 'Integraciones y servicios conectados',
    text: 'APIs, sistemas existentes y comunicación entre plataformas para automatizar procesos.',
  },
  {
    icon: IconChat,
    title: 'Consultoría tecnológica',
    text: 'Relevamiento de procesos, análisis de necesidades, diseño de soluciones y acompañamiento en la implementación.',
  },
]

const steps = [
  {
    icon: IconSearch,
    title: 'Relevamos',
    text: 'Entendemos procesos, problemas y la forma real de trabajo de tu empresa.',
  },
  {
    icon: IconLayout,
    title: 'Diseñamos',
    text: 'Definimos una solución adecuada a las necesidades y prioridades del negocio.',
  },
  {
    icon: IconSliders,
    title: 'Implementamos',
    text: 'Desarrollamos, configuramos e integramos la solución en tu operación.',
  },
  {
    icon: IconUsers,
    title: 'Acompañamos',
    text: 'Seguimos el funcionamiento, realizamos mejoras y acompañamos el crecimiento.',
  },
]

const capabilities = [
  {
    title: 'Sistemas de gestión',
    text: 'Digitalización de procesos administrativos, comerciales y operativos en una plataforma central.',
  },
  {
    title: 'Plataformas IoT',
    text: 'Telemetría y monitoreo de dispositivos conectados para la toma de decisiones.',
  },
  {
    title: 'Control de acceso',
    text: 'Gestión de lectores, sensores y eventos de seguridad integrados en un único lugar.',
  },
  {
    title: 'Comunicación en tiempo real',
    text: 'Integraciones de comunicación WebRTC entre personas y dispositivos.',
  },
  {
    title: 'Streaming',
    text: 'Transmisión y distribución de contenido en vivo o bajo demanda.',
  },
  {
    title: 'Sistemas para organizaciones',
    text: 'Plataformas adaptadas a estructuras y procesos internos específicos.',
  },
]

function SectionHeading({ eyebrow, title, text, center = false, light = false }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2
        className={`mt-3 text-3xl font-bold sm:text-4xl ${light ? 'text-white' : 'text-slate-900'
          }`}
      >
        {title}
      </h2>
      {text && (
        <p className={`mt-4 text-lg ${light ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Panozo Sistemas
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Tecnología que se adapta a cómo trabaja tu empresa.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Desarrollamos software, infraestructura y soluciones conectadas para simplificar
              procesos y acompañar el crecimiento de tu organización.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                Hablemos de tu proyecto
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/soluciones"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-brand hover:text-brand"
              >
                Conocer soluciones
              </Link>
            </div>
          </div>

          {/* Mockup abstracto de plataforma (construido con UI propia) */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="ml-3 text-xs font-medium text-slate-500">
                  Una plataforma para tu operación
                </span>
              </div>
              <div className="flex">
                <div className="hidden w-16 flex-col items-center gap-3 border-r border-slate-100 bg-slate-50 py-4 sm:flex">
                  <span className="h-8 w-8 rounded-md bg-brand/10" />
                  <span className="h-8 w-8 rounded-md bg-slate-200" />
                  <span className="h-8 w-8 rounded-md bg-slate-200" />
                  <span className="mt-auto h-8 w-8 rounded-md bg-accent/20" />
                </div>
                <div className="flex-1 space-y-4 p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {['Ventas', 'Stock', 'Reportes'].map((label) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">—</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Actividad de la operación
                    </p>
                    <div className="mt-2 flex h-24 items-end gap-2">
                      {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-t ${i === 5 ? 'bg-primary' : 'bg-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Servidores operativos
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      Dispositivos conectados
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DOS GRANDES ÁREAS ============ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Qué hacemos"
          title="Dos áreas que trabajan juntas"
          text="No vendemos tecnologías sueltas: combinamos software e infraestructura para resolver la operación completa."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-card">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <IconCode className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Software y sistemas de gestión
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Desarrollamos sistemas que acompañan la operación real de tu empresa: administración,
              comercial, compras, proveedores, stock, presupuestos, pedidos y reportes, integrados
              en una misma plataforma que se adapta a tus procesos.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Administración', 'Comercial', 'Compras', 'Stock', 'Reportes', 'Integraciones'].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-card">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <IconServer className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Infraestructura y soluciones tecnológicas
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Servidores, redes, conectividad, servicios cloud e integración de sistemas, con
              soporte y seguridad tecnológica para que tu operación esté siempre disponible.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Servidores', 'Redes', 'Conectividad', 'Cloud', 'Soporte', 'Seguridad'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ============ SERVICIOS ============ */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Soluciones"
            title="Cómo podemos ayudarte"
            text="Seis áreas de servicio que se combinan según lo que tu organización necesita."
            center
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FRASE DE POSICIONAMIENTO ============ */}
      <section className="bg-brand-dark py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-2xl font-semibold leading-snug text-white sm:text-3xl">
            La infraestructura mantiene tu empresa conectada.
            <br />
            El software transforma la forma en que trabaja.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Dos mundos que, integrados, simplifican la operación y acompañan el crecimiento.
          </p>
        </div>
      </section>

      {/* ============ CÓMO TRABAJAMOS ============ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Cómo trabajamos"
          title="No entregamos solo un programa"
          text="Acompañamos todo el proceso, desde entender tu operación hasta hacer crecer la solución."
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-5 text-4xl font-bold text-slate-100">
                {i + 1}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ EXPERIENCIA REAL ============ */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Experiencia"
            title="Capacidades construidas en proyectos reales"
            text="Representamos nuestras capacidades sin exponer información confidencial de clientes."
            center
          />
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {capabilities.map(({ title, text }) => (
              <li key={title} className="flex items-start gap-3 border-b border-slate-200 pb-6">
                <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ CONFIANZA ============ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-card sm:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Confianza
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Soluciones construidas para necesidades reales
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Trabajamos con organizaciones que necesitan ordenar sus procesos, conectar sus
                operaciones y hacer crecer su tecnología sin depender de soluciones genéricas.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Enfoque en procesos reales, no en tecnologías de moda',
                  'Implementación cercana, pensada para tu equipo',
                  'Acompañamiento continuo después de la puesta en marcha',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Software', 'Infraestructura', 'IoT', 'Control de acceso'].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center"
                >
                  <p className="text-lg font-semibold text-brand">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACTO ============ */}
      <section className="bg-slate-50 py-14 sm:py-20" id="contacto">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Contacto"
                title="Hablemos de tu proyecto"
                text="Contanos qué necesitás mejorar, integrar o desarrollar. Podemos ayudarte a evaluar la solución adecuada."
              />
              <ul className="mt-8 space-y-4 text-slate-700">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <IconArrowRight className="h-4 w-4" />
                  </span>
                  Respondemos a tu consulta y coordinamos una conversación inicial.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
