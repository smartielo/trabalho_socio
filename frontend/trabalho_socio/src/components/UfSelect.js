import React from 'react';

const UfSelect = ({ id, name, value, onChange }) => {
  const ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO"
  ];

  return (
    <select id={id} name={name} className="input" value={value} onChange={onChange}>
      <option value="">Selecione</option>
      {ufs.map(uf => (
        <option key={uf} value={uf}>{uf}</option>
      ))}
    </select>
  );
};

export default UfSelect;

/**
 * NOTA PARA O FUTURO:
 * Para implementar a seleção de cidades baseada no estado, você pode usar o `useEffect`
 * para observar mudanças no estado da UF e, então, fazer uma chamada a uma API
 * como a do IBGE para buscar os municípios correspondentes.
 *
 * Exemplo de API:
 * `https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios`
 *
 * Você precisaria de um estado para armazenar a UF selecionada e outro para as cidades.
 *
 * const [selectedUf, setSelectedUf] = useState('');
 * const [cities, setCities] = useState([]);
 */