import Link from 'next/link';
import Button from '@/app/components/ui/Button';

export default function Home() {
  return (
    <div className='container-home'>
      <div className='content-home'>
        <div className='hero-home'>
          <h1 className='title-home'>
          Bienvenue Elengi Water
          </h1>
          <p className='subtitle-home'>
            Sur votre gestion des finances
          </p>
          <Link href="/login">
          <Button>Connexion</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}