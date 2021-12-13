type Props = { mainElement: React.ReactNode }

export const OneColumnLayout: React.FC<Props> = ({ mainElement }) => {
  return (
    <section>
      <div>{mainElement}</div>
    </section>
  )
}
