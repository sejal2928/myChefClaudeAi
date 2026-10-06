import cheficon from './images/cheficon.png'
export default function Header() {
    return (
        <header>
        <img src={cheficon} alt="chef icon" />
        <h1>Chef Claude</h1>
        </header>
    )
}