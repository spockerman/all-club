import { Ionicons } from '@expo/vector-icons'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

type Props = {
  name: IoniconName
  color: string
  size: number
}

export function TabIcon({ name, color, size }: Props) {
  return <Ionicons name={name} size={size} color={color} />
}
