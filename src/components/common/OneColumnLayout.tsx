type Props = { mainElement: React.ReactNode }

export const TwoColumnLayout: React.FC<Props> = ({ mainElement }) => {
  return (
    <section>
      <div>{mainElement}</div>
    </section>
  )
}
