import { useState } from 'react'
import { Button } from './components/Button'
import { Chips } from './components/Chips'
import { EmptyState } from './components/EmptyState'
import { PlusIcon, TrashIcon } from './components/icons'
import { SearchIllustration, EmptyBoxIllustration } from './components/Illustrations'
import './app.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function Section({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section className="section">
      <header className="section__header">
        <span className="section__eyebrow">{eyebrow}</span>
        <h2 className="section__title">{title}</h2>
        <p className="section__hint">{hint}</p>
      </header>
      <div className="section__body">{children}</div>
    </section>
  )
}

export default function App() {
  const [filters, setFilters] = useState<string[]>(['Ativos'])
  const toggle = (name: string) =>
    setFilters((f) => (f.includes(name) ? f.filter((x) => x !== name) : [...f, name]))

  return (
    <main className="page">
      <h1 className="page__title">Code Connect — mapeamento de componentes</h1>
      <p className="page__lead">
        Como mapear <strong>props</strong>, <strong>variantes</strong>, <strong>imports</strong> e{' '}
        <strong>componentes compostos</strong> entre React/TypeScript e Figma.
      </p>

      <Section
        eyebrow="1 · Props e variantes"
        title="Button"
        hint="enum → variant property · boolean → boolean/variant property · children → text property · ReactNode → instance swap"
      >
        <div className="grid">
          {VARIANTS.map((v) => (
            <div key={v} className="row">
              {SIZES.map((s) => (
                <Button key={s} variant={v} size={s}>
                  {v} / {s}
                </Button>
              ))}
            </div>
          ))}
          <div className="row">
            <Button iconLeft={<PlusIcon />}>Com ícone</Button>
            <Button variant="danger" iconLeft={<TrashIcon />}>
              Excluir
            </Button>
            <Button variant="secondary" disabled>
              Desabilitado
            </Button>
          </div>
          <div className="row row--block">
            <Button fullWidth>Full width</Button>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="2 · Componente composto + import"
        title="Chips.Filter"
        hint="Chips.Group / Chips.Filter vivem num namespace; o Code Connect precisa declarar o import explicitamente."
      >
        <Chips.Group label="Filtros">
          <Chips.Filter
            label="Ativos"
            count={12}
            selected={filters.includes('Ativos')}
            onClick={() => toggle('Ativos')}
          />
          <Chips.Filter
            label="Arquivados"
            count={3}
            selected={filters.includes('Arquivados')}
            onClick={() => toggle('Arquivados')}
          />
          <Chips.Filter
            label="Rascunhos"
            selected={filters.includes('Rascunhos')}
            onClick={() => toggle('Rascunhos')}
          />
          <Chips.Filter label="Últimos 30 dias" dismissible onDismiss={() => {}} />
          <Chips.Filter label="Indisponível" disabled />
        </Chips.Group>
      </Section>

      <Section
        eyebrow="3 · Composição / nested instances"
        title="EmptyState"
        hint="Recebe uma ilustração (SVG) e um Button como children — mapeados com figma.instance / figma.children."
      >
        <div className="stack">
          <EmptyState
            illustration={<SearchIllustration />}
            title="Nenhum resultado encontrado"
            description="Tente ajustar os filtros ou buscar por outro termo."
            action={<Button variant="primary">Limpar filtros</Button>}
            secondaryAction={<Button variant="ghost">Ver tudo</Button>}
          />
          <EmptyState
            size="sm"
            illustration={<EmptyBoxIllustration />}
            title="Sua lista está vazia"
            action={<Button size="sm" iconLeft={<PlusIcon />}>Adicionar item</Button>}
          />
        </div>
      </Section>
    </main>
  )
}
