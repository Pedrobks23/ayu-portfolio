import { useParams } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import AdminLayout from '@/components/admin/AdminLayout';
import FormObra from '@/components/admin/FormObra';

export default function ObraForm() {
  const { slug } = useParams();
  const { getObra } = useObras();
  const obraExistente = slug ? getObra(slug) : null;
  const editando = Boolean(obraExistente);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '900px' }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: '8px',
          }}
        >
          {editando ? 'Editar obra' : 'Nova obra'}
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.8rem,3vw,2.6rem)',
            fontWeight: 300,
            marginBottom: '48px',
          }}
        >
          {editando ? obraExistente.titulo : 'Cadastrar obra'}
        </div>

        <FormObra obraExistente={obraExistente} />
      </div>
    </AdminLayout>
  );
}
