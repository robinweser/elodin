import './Header.blu.css'

export function Header(props) {
  return {
    _className: 'Header',
    "@media (min-width: 320px)":{"fontSize":props.fontSize,
":hover":{"fontSize":props.size}}
  }
}