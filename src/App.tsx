import { Reducer, createContext, useCallback, useContext, useReducer, useState } from 'react'
import './App.css'

interface FormState {
  name: string
  surname: string
  age: number
  email: string
  comment: string
}

type ActionType = {
  type: 'set'
  payload: {
    name: keyof FormState
    value: Partial<FormState[keyof FormState]>
  }
}

const reducer = (state: FormState, action: ActionType) => {
  switch (action.type) {
    case 'set':
      const { name, value } = action.payload
      return {
        ...state,
        [name]: value,
      }
  }
}

const useFormState = (initialState: FormState) => {
  const [state, dispatch] = useReducer<Reducer<FormState, ActionType>>(reducer, initialState)

  const onChange: <K extends keyof FormState>(value: K) => (value: Partial<FormState[K]>) => void = useCallback(
    name => value => {
      dispatch({
        type: 'set',
        payload: {
          name,
          value,
        },
      })
    },
    [dispatch],
  )

  return {
    state,
    onChange,
  }
}

interface FormContextState {
  state: FormState
  onChange: <K extends keyof FormState>(value: K) => (value: Partial<FormState[K]>) => void
  nextStep: () => void
}
const FormContext = createContext<FormContextState | null>(null)

const steps: Record<
  keyof FormState | 'result' | 'preview',
  {
    Page: () => JSX.Element
    Controls?: (() => JSX.Element) | null
  }
> = {
  name: {
    Page: () => {
      const context = useContext(FormContext)
      return (
        <>
          <input
            type="text"
            placeholder="Name"
            onChange={e => context?.onChange('name')(e.target.value)}
            value={context?.state.name}
          />
        </>
      )
    },
  },
  surname: {
    Page: () => {
      const context = useContext(FormContext)
      return (
        <>
          <input
            type="text"
            placeholder="Surname"
            onChange={e => context?.onChange('surname')(e.target.value)}
            value={context?.state.surname}
          />
        </>
      )
    },
  },
  age: {
    Page: () => {
      const context = useContext(FormContext)
      return (
        <>
          <input
            type="text"
            placeholder="Age"
            onChange={e => context?.onChange('age')(+e.target.value)}
            value={context?.state.age}
          />
        </>
      )
    },
  },
  comment: {
    Page: () => {
      const context = useContext(FormContext)
      return (
        <>
          <textarea
            placeholder="Comment"
            onChange={e => context?.onChange('comment')(e.target.value)}
            value={context?.state.comment}
          />
        </>
      )
    },
  },
  email: {
    Page: () => {
      const context = useContext(FormContext)
      return (
        <>
          <input
            type="email"
            placeholder="Email"
            onChange={e => context?.onChange('email')(e.target.value)}
            value={context?.state.email}
          />
        </>
      )
    },
    Controls: () => {
      const context = useContext(FormContext)
      return (
        <button
          onClick={() => {
            context?.nextStep()
          }}
        >
          Watch preview
        </button>
      )
    },
  },
  preview: {
    Page: () => {
      return (
        <>
          Preview:
          {Object.entries(steps)
            .slice(0, 5)
            .map(([key, value]) => {
              const Page = value.Page

              return (
                <div key={key}>
                  <Page />
                </div>
              )
            })}
        </>
      )
    },
    Controls: () => {
      const context = useContext(FormContext)

      return (
        <button
          onClick={() => {
            context?.nextStep()
          }}
        >
          Submit
        </button>
      )
    },
  },
  result: {
    Page: () => {
      const context = useContext(FormContext)

      return (
        <>
          Result:
          <p>
            User: {context?.state.name} {context?.state.surname}, {context?.state.age} years
          </p>
          <p>Email: {context?.state.email}</p>
          <p>Some comment: {context?.state.comment}</p>
        </>
      )
    },
    Controls: null,
  },
}

function App() {
  const { onChange, state } = useFormState({
    age: 22,
    comment: '',
    email: '',
    name: '',
    surname: '',
  })

  const value = {
    state,
    nextStep: () => {
      const keys = Object.keys(steps)
      const index = keys.findIndex(k => k === currentStep)
      const nextStep = keys[index + 1] as keyof FormState
      setCurrentStep(nextStep)
    },
    onChange,
  }

  const [currentStep, setCurrentStep] = useState<keyof FormState>('name')

  const step = steps[currentStep]

  const Page = step.Page
  const Controls =
    step.Controls === undefined
      ? () => (
          <button
            onClick={() => {
              value.nextStep()
            }}
          >
            Next
          </button>
        )
      : step.Controls

  return (
    <FormContext.Provider value={value}>
      <div>
        <Page />
        {Controls && <Controls />}
      </div>
    </FormContext.Provider>
  )
}

export default App
