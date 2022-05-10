import classNames from 'classnames';

export default function Steps({ steps, currentStepIndex }) {
  return (
    <ul className="steps steps-vertical">
      {steps.map((step, index) => (
        <li
          key={step}
          className={classNames('step', index === currentStepIndex ? 'step-primary' : '')}
          data-content={(currentStepIndex > index || currentStepIndex === index) ? '✓' : (index + 1)}
        >
          {step}
        </li>
      ))}
    </ul>
  );
}
