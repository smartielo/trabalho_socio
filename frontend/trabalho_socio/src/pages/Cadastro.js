import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o hook para navegação
import '../styles/cadastro.css'; // Importa o CSS específico do formulário
import brasao from '../assets/brasao.png';
import instituto from '../assets/instituto.png';
import sagrado from '../assets/Sagrado.png';
import InputMask from 'react-input-mask'; // Importa a biblioteca de máscara de input
import UfSelect from '../components/UfSelect'; // Importa o novo componente

const Cadastro = () => {
  const navigate = useNavigate(); // Instancia o hook de navegação
  // Estado para controlar os valores do formulário (opcional por enquanto, mas boa prática)
  const [formData, setFormData] = useState({
    ufNaturalidade: '',
    ufRg: '',
    nis: '',
    rg: '',
    cpf: '',
    nisResponsavel: '',
    rgResponsavel: '',
    cpfResponsavel: '',
    situacao_escolar: '',
    serie: '',
    frequenta_eja: '',
    eja_semestre: '',
    orgaoDemandante: [],
    orgaoDemandanteOutro: '',
    publicoPrioritario: [],
    beneficios: [],
    bpcDeficienciaEspecificar: '',
    crasReferencia: '',
    tecnicoReferencia: '',
    nomeEntidade: '',
    enderecoEntidade: '',
    emailEntidade: '',
    telefoneEntidade: '',
    responsavelPreenchimento: '',
    // Novos campos da família
    chefeFamilia: '',
    chefeFamiliaOutro: '',
    religiaoFamilia: '',
    localTrabalhoFamilia: '',
    rendaFamiliar: '',
    familiaPossuiDeficiencia: '',
    deficienteSexo: '',
    deficienteFaixaEtaria: '',
    // Novos campos de Saúde e Responsáveis
    medicamentoUso: '',
    alergiaDescricao: '',
    tecnicoResponsavel: '',
    responsavelGeral: '',
    telefoneContato: '',
    // Campos para a nova etapa de senha
    senha: '',
    confirmarSenha: '',
  });

  // Estado para controlar a visibilidade do campo "tempo fora da escola"
  const [showTempoForaEscola, setShowTempoForaEscola] = useState(false);

  // Estado para controlar a visibilidade dos detalhes do EJA/CEJA
  const [showEjaDetails, setShowEjaDetails] = useState(false);

  // Estado para controlar a visibilidade do campo "Outro" de Órgão Demandante
  const [showOrgaoOutro, setShowOrgaoOutro] = useState(false);

  // Estado para controlar a visibilidade do input de BPC Deficiência
  const [showBpcDeficienciaInput, setShowBpcDeficienciaInput] = useState(false);

  // Estado para a lista dinâmica de membros da família
  const [familyMembers, setFamilyMembers] = useState([{ nome: '', parentesco: '', idade: '' }]);

  // Estados para os novos campos condicionais
  const [showChefeOutroInput, setShowChefeOutroInput] = useState(false);
  const [showDeficienciaDetails, setShowDeficienciaDetails] = useState(false);

  // Estado para armazenar os erros de validação
  const [errors, setErrors] = useState({});

  // Estado para controlar a etapa atual do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Efeito para controlar o estilo do body e permitir a rolagem
  useEffect(() => {
    // Adiciona a classe ao body quando o componente é montado
    document.body.classList.add('cadastro-page-active');

    // Função de limpeza: remove a classe quando o componente é desmontado
    return () => {
      document.body.classList.remove('cadastro-page-active');
    };
  }, []); // O array vazio garante que isso rode apenas uma vez (montagem/desmontagem)

  // Função genérica para lidar com inputs de texto simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para garantir que apenas números sejam inseridos nos campos designados
  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, ''); // Remove qualquer caractere que não seja um número
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  // Função para formatar o número de telefone com máscara
  const handlePhoneInputChange = (e) => {
    const { name, value } = e.target;
    // Remove tudo que não for dígito
    let numericValue = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    numericValue = numericValue.slice(0, 11);

    // Aplica a máscara
    if (numericValue.length > 10) {
      // (XX) XXXXX-XXXX
      numericValue = numericValue.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (numericValue.length > 6) {
      // (XX) XXXX-XXXX
      numericValue = numericValue.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (numericValue.length > 2) {
      // (XX) XXXX
      numericValue = numericValue.replace(/^(\d{2})(\d{0,4}).*/, '($1) $2');
    } else if (numericValue.length > 0) {
      numericValue = numericValue.replace(/^(\d*)/, '($1');
    }

    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  // Função genérica para lidar com checkboxes que atualizam um array no estado
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const list = prev[name] ? [...prev[name]] : [];
      if (checked) {
        list.push(value);
      } else {
        const index = list.indexOf(value);
        if (index > -1) list.splice(index, 1);
      }
      return { ...prev, [name]: list };
    });
  };

  const handleSituacaoEscolarChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, situacao_escolar: value }));
    setShowTempoForaEscola(value === 'nao_frequenta');
  }

  const handleEjaChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, frequenta_eja: value }));
    setShowEjaDetails(value === 'sim');
  };

  // Funções para gerenciar a lista de membros da família
  const handleFamilyMemberChange = (index, event) => {
    const { name, value } = event.target;
    const updatedMembers = [...familyMembers];
    updatedMembers[index][name] = name === 'idade' ? value.replace(/[^0-9]/g, '') : value;
    setFamilyMembers(updatedMembers);
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { nome: '', parentesco: '', idade: '' }]);
  };

  const removeFamilyMember = (index) => {
    const updatedMembers = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updatedMembers);
  };

  // Função para formatar a renda familiar como moeda (R$)
  const handleRendaInputChange = (e) => {
    const { name, value } = e.target;
    let numericValue = value.replace(/\D/g, '');

    if (numericValue === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }

    // Formata para o padrão BRL (ex: 123456 -> R$ 1.234,56)
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue / 100);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Pega a data atual para exibir no final do formulário
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  // Função para validar o formulário
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.nomeCompleto) newErrors.nomeCompleto = 'O nome completo é obrigatório.';
      if (!formData.dataNascimento) newErrors.dataNascimento = 'A data de nascimento é obrigatória.';
      if (!formData.sexo) newErrors.sexo = 'A seleção do sexo é obrigatória.';
      if (!formData.rg) newErrors.rg = 'O RG é obrigatório.';
      if (!formData.cpf) newErrors.cpf = 'O CPF é obrigatório.';
      if (!formData.nomeResponsavel) newErrors.nomeResponsavel = 'O nome do responsável é obrigatório.';
      if (!formData.rgResponsavel) newErrors.rgResponsavel = 'O RG do responsável é obrigatório.';
      if (!formData.cpfResponsavel) newErrors.cpfResponsavel = 'O CPF do responsável é obrigatório.';
    }
    // Adiciona validação para a nova etapa 4
    if (step === 4) {
      if (!formData.senha) {
        newErrors.senha = 'A senha é obrigatória.';
      } else if (formData.senha.length < 8) {
        newErrors.senha = 'A senha deve ter no mínimo 8 caracteres.';
      }
      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'As senhas não coincidem.';
      }
    }
    // Adicione validações para os passos 2 e 3 aqui, se necessário

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funções para navegar entre as etapas
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Valida a última etapa antes de submeter
    const isValid = validateStep(currentStep);

    if (isValid) {
      const fullFormData = { ...formData, membrosFamiliares: familyMembers };
      console.log("Dados do Formulário:", fullFormData);
      alert("Cadastro enviado! Verifique o console para ver os dados.");
      // Aqui você enviaria os dados para a API
    }
  };


  return (
    <>
      <div className="app-container">
        <header className="cadastro-header">
          <img src={brasao} alt="Brasão da Instituição" className="header-brasao" />
          <div className="header-divider" />
          <div className="header-logos-instituto">
            <img src={instituto} alt="Instituto das Apóstolas" className="header-instituto" />
            <img src={sagrado} alt="Sagrado Coração de Jesus" className="header-sagrado" />
          </div>
        </header>

        <div className="cadastro-form-container">

          <h1 className="cadastro-title">Cadastro</h1>

          {/* Indicador de Etapas */}
          <div className="step-indicator">
            <p>Passo {currentStep} de {totalSteps}</p>
          </div>

          <form onSubmit={handleSubmit}>

          {/* --- PASSO 1: IDENTIFICAÇÃO --- */}
          {currentStep === 1 && ( <>
            {/* --- Público Alvo --- */}
            <div className="form-group">
              <label className="cadastro-label">Público Alvo</label>
              <div className="radio-group-horizontal">
                {['Criança', 'Adolescente', 'Jovem', 'Idoso', 'Intergeracional'].map(item => (
                  <div key={item} className="radio-item">
                    <input type="checkbox" id={`pa_${item}`} name="publico_alvo" value={item} />
                    <label htmlFor={`pa_${item}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Dados Pessoais --- */}
            <div className="form-group">
              <label htmlFor="nomeCompleto" className="cadastro-label">Nome Completo</label>
            <input type="text" id="nomeCompleto" name="nomeCompleto" className={`input ${errors.nomeCompleto ? 'error' : ''}`} placeholder="Digite o nome completo" value={formData.nomeCompleto} onChange={handleChange} />
            {errors.nomeCompleto && <p className="error-message">{errors.nomeCompleto}</p>}
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="dataNascimento" className="cadastro-label">Data de Nascimento</label>
              <input type="date" id="dataNascimento" name="dataNascimento" className={`input ${errors.dataNascimento ? 'error' : ''}`} value={formData.dataNascimento} onChange={handleChange} />
              {errors.dataNascimento && <p className="error-message">{errors.dataNascimento}</p>}
            </div>

            <div className="form-group">
              <label className="cadastro-label">Sexo</label>
              <div className={`radio-group-horizontal ${errors.sexo ? 'error-radio' : ''}`}>
                <div className="radio-item">
                  <input type="radio" id="sexoMasc" name="sexo" value="Masculino" onChange={handleChange} checked={formData.sexo === 'Masculino'} />
                  <label htmlFor="sexoMasc">Masculino</label>
                </div>
                <div className="radio-item">
                  <input type="radio" id="sexoFem" name="sexo" value="Feminino" onChange={handleChange} checked={formData.sexo === 'Feminino'} />
                  <label htmlFor="sexoFem">Feminino</label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nis" className="cadastro-label">NIS</label>
            <input type="text" id="nis" name="nis" className="input" placeholder="Apenas números" value={formData.nis} onChange={handleNumericInputChange} inputMode="numeric" />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="ufNaturalidade" className="cadastro-label">UF</label>
              <UfSelect id="ufNaturalidade" name="ufNaturalidade" />
            </div>
            <div className="form-group">
              <label htmlFor="naturalidadeCidade" className="cadastro-label">Naturalidade (Cidade)</label>
              <input type="text" id="naturalidadeCidade" name="naturalidadeCidade" className="input" placeholder="Digite a cidade" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="endereco" className="cadastro-label">Endereço Completo</label>
            <input type="text" id="endereco" name="endereco" className="input" placeholder="Rua, número, bairro, CEP" />
          </div>

          {/* --- Documentos --- */}
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="rg" className="cadastro-label">RG</label>
              <InputMask
                mask="99.999.999-9" // Máscara para RG
                maskChar={null} // Remove o preenchimento da máscara
                id="rg"
                name="rg"
                className={`input ${errors.rg ? 'error' : ''}`}
                placeholder="Apenas números"
                value={formData.rg}
                onChange={handleChange} // Usar o handleChange genérico
              />
              {errors.rg && <p className="error-message">{errors.rg}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="orgaoEmissor" className="cadastro-label">Órgão Emissor</label>
              <input type="text" id="orgaoEmissor" name="orgaoEmissor" className="input" />
            </div>
            <div className="form-group">
              <label htmlFor="ufRg" className="cadastro-label">UF</label>
              <UfSelect id="ufRg" name="ufRg" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cpf" className="cadastro-label">CPF</label>
            <InputMask
              mask="999.999.999-99" // Máscara para CPF
              maskChar={null} // Remove o preenchimento da máscara
              id="cpf"
              name="cpf"
              className={`input ${errors.cpf ? 'error' : ''}`}
              placeholder="Apenas números"
              value={formData.cpf}
              onChange={handleChange} // Usar o handleChange genérico
            />
            {errors.cpf && <p className="error-message">{errors.cpf}</p>}
          </div>

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Certidão de Nascimento --- */}
          <h2 className="form-section-title">Certidão de Nascimento</h2>
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="certidaoFls" className="cadastro-label">Fls.</label>
              <input type="text" id="certidaoFls" name="certidaoFls" className="input" />
            </div>
            <div className="form-group">
              <label htmlFor="certidaoLivro" className="cadastro-label">Livro</label>
              <input type="text" id="certidaoLivro" name="certidaoLivro" className="input" />
            </div>
            <div className="form-group">
              <label htmlFor="dataRegistro" className="cadastro-label">Data do Registro</label>
              <input type="date" id="dataRegistro" name="dataRegistro" className="input" />
            </div>
          </div>

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Responsável Legal --- */}
          <h2 className="form-section-title">Responsável Legal</h2>

          <div className="form-group">
            <label htmlFor="nomeResponsavel" className="cadastro-label">Nome do Responsável Legal</label>
            <input type="text" id="nomeResponsavel" name="nomeResponsavel" className={`input ${errors.nomeResponsavel ? 'error' : ''}`} placeholder="Digite o nome completo" value={formData.nomeResponsavel} onChange={handleChange} />
            {errors.nomeResponsavel && <p className="error-message">{errors.nomeResponsavel}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="nisResponsavel" className="cadastro-label">NIS</label>
            <input type="text" id="nisResponsavel" name="nisResponsavel" className="input" placeholder="Apenas números" value={formData.nisResponsavel} onChange={handleNumericInputChange} inputMode="numeric" />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="rgResponsavel" className="cadastro-label">RG</label>
              <InputMask
                mask="99.999.999-9" // Máscara para RG
                maskChar={null} // Remove o preenchimento da máscara
                id="rgResponsavel"
                name="rgResponsavel"
                className={`input ${errors.rgResponsavel ? 'error' : ''}`}
                placeholder="Apenas números"
                value={formData.rgResponsavel}
                onChange={handleChange} // Usar o handleChange genérico
              />
              {errors.rgResponsavel && <p className="error-message">{errors.rgResponsavel}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="orgaoEmissorResponsavel" className="cadastro-label">Órgão Emissor</label>
              <input type="text" id="orgaoEmissorResponsavel" name="orgaoEmissorResponsavel" className="input" />
            </div>
            <div className="form-group">
              <label htmlFor="ufRgResponsavel" className="cadastro-label">UF</label>
              <UfSelect id="ufRgResponsavel" name="ufRgResponsavel" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cpfResponsavel" className="cadastro-label">CPF</label>
            <InputMask
              mask="999.999.999-99" // Máscara para CPF
              maskChar={null} // Remove o preenchimento da máscara
              id="cpfResponsavel"
              name="cpfResponsavel"
              className={`input ${errors.cpfResponsavel ? 'error' : ''}`}
              placeholder="Apenas números"
              value={formData.cpfResponsavel}
              onChange={handleChange} // Usar o handleChange genérico
            />
            {errors.cpfResponsavel && <p className="error-message">{errors.cpfResponsavel}</p>}
          </div>
          </>)}


          {/* --- PASSO 2: CONTEXTO SOCIAL --- */}
          {currentStep === 2 && ( <>
            {/* --- Divisor --- */}
            <hr className="form-divider" />
  
            {/* --- Situação Escolar --- */}
            <h2 className="form-section-title">Situação Escolar Atual</h2>
            <div className="form-group">
              <div className="radio-group-horizontal">
              <div className="radio-item">
                <input type="radio" id="frequentaEscola" name="situacao_escolar" value="frequenta" checked={formData.situacao_escolar === 'frequenta'} onChange={handleSituacaoEscolarChange} />
                <label htmlFor="frequentaEscola">Frequenta a escola</label>
              </div>
              <div className="radio-item">
                <input type="radio" id="naoFrequentaEscola" name="situacao_escolar" value="nao_frequenta" checked={formData.situacao_escolar === 'nao_frequenta'} onChange={handleSituacaoEscolarChange} />
                <label htmlFor="naoFrequentaEscola">Não frequenta a escola</label>
              </div>
            </div>
          </div>

          {showTempoForaEscola && (
            <div className="form-group">
              <label htmlFor="tempoForaEscola" className="cadastro-label">Há quanto tempo está fora do ambiente escolar?</label>
              <input type="text" id="tempoForaEscola" name="tempoForaEscola" className="input" placeholder="Ex: 6 meses, 1 ano..." />
            </div>
          )}

          {/* --- Dados Escolares (só aparece se frequenta a escola) --- */}
          {formData.situacao_escolar === 'frequenta' && (
            <>
              <hr className="form-divider" />
              <h2 className="form-section-title">Dados da Escola</h2>

              <div className="form-group">
                <label className="cadastro-label">Frequenta a EJA ou CEJA?</label>
                <div className="radio-group-horizontal">
                  <div className="radio-item">
                    <input type="radio" id="eja_sim" name="frequenta_eja" value="sim" checked={formData.frequenta_eja === 'sim'} onChange={handleEjaChange} />
                    <label htmlFor="eja_sim">Sim</label>
                  </div>
                  <div className="radio-item">
                    <input type="radio" id="eja_nao" name="frequenta_eja" value="nao" checked={formData.frequenta_eja === 'nao'} onChange={handleEjaChange} />
                    <label htmlFor="eja_nao">Não</label>
                  </div>
                </div>
              </div>

              {showEjaDetails && (
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="cadastro-label">Segmento</label>
                    <div className="radio-group-horizontal">
                      {['1°', '2°', '3°'].map(item => (
                        <div className="radio-item" key={item}>
                          <input type="radio" id={`seg_${item}`} name="eja_segmento" value={item} />
                          <label htmlFor={`seg_${item}`}>{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group form-group-small">
                    <label htmlFor="eja_semestre" className="cadastro-label">Semestre</label>
                    <input type="text" id="eja_semestre" name="eja_semestre" className="input" placeholder="Ex: 01" value={formData.eja_semestre} onChange={handleNumericInputChange} inputMode="numeric" maxLength="2" />
                  </div>
                </div>
              )}

              {/* --- Detalhes da Escola Regular (só aparece se não frequenta EJA) --- */}
              {formData.frequenta_eja === 'nao' && (
                <>
                  <div className="form-group">
                    <label htmlFor="nomeEscola" className="cadastro-label">Nome da Escola</label>
                    <input type="text" id="nomeEscola" name="nomeEscola" className="input" placeholder="Digite o nome da escola" />
                  </div>

                  <div className="form-group">
                    <label className="cadastro-label">Escolaridade</label>
                    <div className="radio-group-horizontal">
                      {['Infantil', 'Fundamental', 'Médio', 'Superior'].map(item => (
                        <div className="radio-item" key={item}>
                          <input type="radio" id={`esc_${item}`} name="escolaridade" value={item} />
                          <label htmlFor={`esc_${item}`}>{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group form-group-small">
                      <label htmlFor="serie" className="cadastro-label">Série</label>
                      <input type="text" id="serie" name="serie" className="input" placeholder="Ex: 9" value={formData.serie} onChange={handleNumericInputChange} inputMode="numeric" maxLength="2" />
                    </div>

                    <div className="form-group">
                      <label className="cadastro-label">Turno</label>
                      <div className="radio-group-horizontal">
                        {['Matutino', 'Vespertino', 'Noturno'].map(item => (
                          <div className="radio-item" key={item}>
                            <input type="radio" id={`turno_${item}`} name="turno" value={item} />
                            <label htmlFor={`turno_${item}`}>{item}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Dados do Encaminhamento --- */}
          <h2 className="form-section-title">Dados do encaminhamento</h2>
          <div className="form-group">
            <label className="cadastro-label">Órgão Demandante para Acesso ao Serviço</label>
            <div className="radio-group-horizontal" style={{ height: 'auto', flexWrap: 'wrap' }}>
              {['CRAS', 'CREAS', 'Ministério Público', 'Conselho Tutelar', 'Defensoria Pública', 'Poder Judiciário'].map(item => (
                <div className="radio-item" key={item}>
                  <input type="checkbox" id={`org_${item}`} name="orgaoDemandante" value={item} onChange={handleCheckboxChange} />
                  <label htmlFor={`org_${item}`}>{item}</label>
                </div>
              ))}
              {/* Checkbox "Outro" com lógica especial */}
              <div className="radio-item">
                <input type="checkbox" id="org_outro" name="orgaoDemandante" value="Outro" onChange={(e) => {
                  handleCheckboxChange(e);
                  setShowOrgaoOutro(e.target.checked);
                }} />
                <label htmlFor="org_outro">Outro. Qual?</label>
              </div>
            </div>
          </div>

          {showOrgaoOutro && (
            <div className="form-group">
              <label htmlFor="orgaoDemandanteOutro" className="cadastro-label">Especifique o outro órgão</label>
              <input type="text" id="orgaoDemandanteOutro" name="orgaoDemandanteOutro" className="input" placeholder="Digite o nome do órgão" />
            </div>
          )}

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Público Prioritário --- */}
          <h2 className="form-section-title">Público Prioritário</h2>
          <div className="form-group">
            <div className="radio-group-vertical">
              {[
                'Em situação de isolamento',
                'Trabalho infantil',
                'Vivência de violência e, ou negligência',
                'Fora da escola ou com desafasagem escolar superior a 2 anos',
                'Situação de abuso e/ou exploração sexual',
                'Vulnerabilidade Social',
                'Egressos de medidas socioeducativas',
                'Com medidas de proteção do ECA',
                'Em cumprimento de MSE',
                'Em situação de acolhimento institucional',
                'Crianças/adolescentes em situação de rua',
              ].map(item => (
                <div className="radio-item" key={item}>
                  <input type="checkbox" id={`pp_${item.replace(/\s/g, '')}`} name="publicoPrioritario" value={item} onChange={handleCheckboxChange} />
                  <label htmlFor={`pp_${item.replace(/\s/g, '')}`}>{item}</label>
                </div>
              ))}
            </div>
          </div>

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Benefícios --- */}
          <h2 className="form-section-title">Benefícios</h2>
          <div className="form-group">
            <div className="radio-group-vertical">
              {[
                'Bolsa Família',
                'Renda Cidadã',
                'Ação Jovem',
                'Renda Cidadã Idoso',
                'BPC Idoso',
              ].map(item => (
                <div className="radio-item" key={item}>
                  <input type="checkbox" id={`ben_${item.replace(/\s/g, '')}`} name="beneficios" value={item} onChange={handleCheckboxChange} />
                  <label htmlFor={`ben_${item.replace(/\s/g, '')}`}>{item}</label>
                </div>
              ))}
              {/* Checkbox especial para BPC Deficiência */}
              <div className="radio-item">
                <input
                  type="checkbox"
                  id="ben_BPCDeficiencia"
                  name="beneficios"
                  value="BPC Deficiência"
                  onChange={(e) => {
                    handleCheckboxChange(e);
                    setShowBpcDeficienciaInput(e.target.checked);
                  }}
                />
                <label htmlFor="ben_BPCDeficiencia">BPC Deficiência - Especificar:</label>
              </div>
            </div>
          </div>

          {showBpcDeficienciaInput && (
            <div className="form-group">
              <label htmlFor="bpcDeficienciaEspecificar" className="cadastro-label">Especifique a deficiência</label>
              <input type="text" id="bpcDeficienciaEspecificar" name="bpcDeficienciaEspecificar" className="input" placeholder="Digite a deficiência" />
            </div>
          )}

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- CRAS --- */}
          <h2 className="form-section-title">CRAS</h2>
          <div className="form-group">
            <label htmlFor="crasReferencia" className="cadastro-label">CRAS de referência</label>
            <input type="text" id="crasReferencia" name="crasReferencia" className="input" placeholder="Digite o nome do CRAS" />
          </div>
          <div className="form-group">
            <label htmlFor="tecnicoReferencia" className="cadastro-label">Técnico de Referência</label>
            <input type="text" id="tecnicoReferencia" name="tecnicoReferencia" className="input" placeholder="Digite o nome do técnico de referência" />
          </div>
          </>)}


          {/* --- PASSO 3: FAMÍLIA E SAÚDE --- */}
          {currentStep === 3 && ( <>
            {/* --- Divisor --- */}
            <hr className="form-divider" />
  
            {/* --- Entidade --- */}
            <h2 className="form-section-title">Entidade</h2>
            <div className="form-group">
              <label htmlFor="nomeEntidade" className="cadastro-label">Nome da entidade</label>
            <input type="text" id="nomeEntidade" name="nomeEntidade" className="input" placeholder="Digite o nome da entidade" />
          </div>
          <div className="form-group">
            <label htmlFor="enderecoEntidade" className="cadastro-label">Endereço</label>
            <input type="text" id="enderecoEntidade" name="enderecoEntidade" className="input" placeholder="Digite o endereço da entidade" />
          </div>
          <div className="form-group">
            <label htmlFor="emailEntidade" className="cadastro-label">E-mail</label>
            <input type="email" id="emailEntidade" name="emailEntidade" className="input" placeholder="exemplo@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="telefoneEntidade" className="cadastro-label">DDD/Telefone</label>
            <input type="tel" id="telefoneEntidade" name="telefoneEntidade" className="input" placeholder="(XX) XXXXX-XXXX" value={formData.telefoneEntidade} onChange={handlePhoneInputChange} maxLength="15" />
          </div>

          <div className="form-group">
            <label htmlFor="responsavelPreenchimento" className="cadastro-label">Responsável pelo preenchimento</label>
            <input type="text" id="responsavelPreenchimento" name="responsavelPreenchimento" className="input" placeholder="Digite o nome do responsável" />
          </div>



          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Membros Familiares --- */}
          <h2 className="form-section-title">Membros Familiares</h2>
          <div className="family-members-container">
            {/* Cabeçalho da Tabela */}
            <div className="family-members-header">
              <div className="family-col-nome">Nome</div>
              <div className="family-col-parentesco">Grau de Parentesco</div>
              <div className="family-col-idade">Idade</div>
              <div className="family-col-action"></div> {/* Espaço para o botão de remover */}
            </div>

            {/* Linhas da Tabela */}
            {familyMembers.map((member, index) => (
              <div key={index} className="family-member-row">
                <input type="text" name="nome" className="input family-col-nome" placeholder="Nome completo" value={member.nome} onChange={(e) => handleFamilyMemberChange(index, e)} />
                <input type="text" name="parentesco" className="input family-col-parentesco" placeholder="Ex: Mãe, Irmão" value={member.parentesco} onChange={(e) => handleFamilyMemberChange(index, e)} />
                <input type="text" name="idade" className="input family-col-idade" placeholder="Ex: 35" value={member.idade} onChange={(e) => handleFamilyMemberChange(index, e)} inputMode="numeric" maxLength="3" />
                <button type="button" className="remove-member-btn" onClick={() => removeFamilyMember(index)}>
                  &times; {/* Símbolo de 'X' para remover */}
                </button>
              </div>
            ))}

            {/* Botão para Adicionar Membro */}
            <button type="button" className="add-member-btn" onClick={addFamilyMember}>
              + Adicionar Membro
            </button>
          </div>



          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Chefe da Família --- */}
          <h2 className="form-section-title">Chefe da família</h2>
          <div className="form-group">
            <div className="radio-group-horizontal">
              {['Mãe', 'Pai', 'Avós'].map(item => (
                <div className="radio-item" key={item}>
                  <input type="radio" id={`chefe_${item}`} name="chefeFamilia" value={item} onChange={(e) => { setFormData(p => ({ ...p, chefeFamilia: e.target.value })); setShowChefeOutroInput(false); }} />
                  <label htmlFor={`chefe_${item}`}>{item}</label>
                </div>
              ))}
              <div className="radio-item">
                <input type="radio" id="chefe_Outros" name="chefeFamilia" value="Outros" onChange={(e) => { setFormData(p => ({ ...p, chefeFamilia: e.target.value })); setShowChefeOutroInput(true); }} />
                <label htmlFor="chefe_Outros">Outros</label>
              </div>
            </div>
          </div>

          {showChefeOutroInput && (
            <div className="form-group">
              <label htmlFor="chefeFamiliaOutro" className="cadastro-label">Especifique quem é o chefe da família</label>
              <input type="text" id="chefeFamiliaOutro" name="chefeFamiliaOutro" className="input" placeholder="Digite aqui" />
            </div>
          )}

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Dados sobre a Família --- */}
          <h2 className="form-section-title">Dados sobre a família</h2>
          <div className="form-group">
            <label htmlFor="religiaoFamilia" className="cadastro-label">Religião da família</label>
            <input type="text" id="religiaoFamilia" name="religiaoFamilia" className="input" placeholder="Digite a religião" value={formData.religiaoFamilia} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="localTrabalhoFamilia" className="cadastro-label">Local de trabalho</label>
            <input type="text" id="localTrabalhoFamilia" name="localTrabalhoFamilia" className="input" placeholder="Digite o local de trabalho" value={formData.localTrabalhoFamilia} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="rendaFamiliar" className="cadastro-label">Renda familiar</label>
            <input type="text" id="rendaFamiliar" name="rendaFamiliar" className="input" placeholder="R$ 0,00" value={formData.rendaFamiliar} onChange={handleRendaInputChange} />
          </div>

          <div className="form-group">
            <label className="cadastro-label">Pessoas com deficiência?</label>
            <div className="radio-group-horizontal">
              <div className="radio-item">
                <input type="radio" id="def_familia_sim" name="familiaPossuiDeficiencia" value="sim" onChange={(e) => { setFormData(p => ({ ...p, familiaPossuiDeficiencia: 'sim' })); setShowDeficienciaDetails(true); }} />
                <label htmlFor="def_familia_sim">Sim</label>
              </div>
              <div className="radio-item">
                <input type="radio" id="def_familia_nao" name="familiaPossuiDeficiencia" value="nao" onChange={(e) => { setFormData(p => ({ ...p, familiaPossuiDeficiencia: 'nao' })); setShowDeficienciaDetails(false); }} />
                <label htmlFor="def_familia_nao">Não</label>
              </div>
            </div>
          </div>

          {showDeficienciaDetails && (
            <div className="form-group-row">
              <div className="form-group">
                <label className="cadastro-label">Sexo</label>
                <div className="radio-group-horizontal">
                  {['Feminino', 'Masculino'].map(item => (<div className="radio-item" key={item}><input type="radio" id={`def_sexo_${item}`} name="deficienteSexo" value={item} onChange={handleChange} /><label htmlFor={`def_sexo_${item}`}>{item}</label></div>))}
                </div>
              </div>
              <div className="form-group">
                <label className="cadastro-label">Faixa Etária</label>
                <div className="radio-group-horizontal">
                  {['Criança', 'Adolescente', 'Adulto'].map(item => (<div className="radio-item" key={item}><input type="radio" id={`def_faixa_${item}`} name="deficienteFaixaEtaria" value={item} onChange={handleChange} /><label htmlFor={`def_faixa_${item}`}>{item}</label></div>))}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="medicamentoUso" className="cadastro-label">Faz uso de algum medicamento? Qual?</label>
            <input type="text" id="medicamentoUso" name="medicamentoUso" className="input" placeholder="Descreva o medicamento" value={formData.medicamentoUso} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="alergiaDescricao" className="cadastro-label">É alérgico? A que?</label>
            <input type="text" id="alergiaDescricao" name="alergiaDescricao" className="input" placeholder="Descreva a alergia" value={formData.alergiaDescricao} onChange={handleChange} />
          </div>

          {/* --- Divisor --- */}
          <hr className="form-divider" />

          {/* --- Responsáveis --- */}
          <div className="form-group">
            <label htmlFor="tecnicoResponsavel" className="cadastro-label">Técnico(a) responsável:</label>
            <input type="text" id="tecnicoResponsavel" name="tecnicoResponsavel" className="input" placeholder="Nome do técnico(a)" value={formData.tecnicoResponsavel} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="responsavelGeral" className="cadastro-label">Responsável:</label>
            <input type="text" id="responsavelGeral" name="responsavelGeral" className="input" placeholder="Nome do responsável" value={formData.responsavelGeral} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="telefoneContato" className="cadastro-label">Telefone de contato:</label>
            <input type="tel" id="telefoneContato" name="telefoneContato" className="input" placeholder="(XX) XXXXX-XXXX" value={formData.telefoneContato} onChange={handlePhoneInputChange} maxLength="15" />
          </div>

          {/* --- Data do Cadastro --- */}
          <div className="form-group">
            <label htmlFor="dataCadastro" className="cadastro-label">Data do Cadastro</label>
            <input type="text" id="dataCadastro" name="dataCadastro" className="input" value={dataAtual} disabled />
          </div>

          </>)}

          {/* --- PASSO 4: CRIAR SENHA --- */}
          {currentStep === 4 && ( <>
            {/* --- Divisor --- */}
            <hr className="form-divider" />

            {/* --- Senha de Acesso --- */}
            <h2 className="form-section-title">Crie sua Senha de Acesso</h2>
            <div className="form-group">
              <label htmlFor="senha" className="cadastro-label">Crie uma senha</label>
              <input type="password" id="senha" name="senha" className={`input ${errors.senha ? 'error' : ''}`} placeholder="Mínimo de 8 caracteres" value={formData.senha} onChange={handleChange} />
              {errors.senha && <p className="error-message">{errors.senha}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmarSenha" className="cadastro-label">Redigite a senha</label>
              <input type="password" id="confirmarSenha" name="confirmarSenha" className={`input ${errors.confirmarSenha ? 'error' : ''}`} placeholder="Confirme sua senha" value={formData.confirmarSenha} onChange={handleChange} />
              {errors.confirmarSenha && <p className="error-message">{errors.confirmarSenha}</p>}
            </div>
          </>)}


          {/* --- Botões de Navegação --- */}
          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button type="button" className="nav-button prev-button" onClick={prevStep}>
                Voltar
              </button>
            )}
            {currentStep < totalSteps && (
              <button type="button" className="nav-button next-button" onClick={nextStep}>
                Avançar
              </button>
            )}
            {currentStep === totalSteps && (
              <button type="submit" className="submit-button">Cadastrar</button>
            )}
          </div>
          </form>
        </div>

        {/* --- Botão Voltar (Fora do formulário) --- */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/')}>
            Voltar
          </button>
        </div>
      </div>
    </>
  );
};

export default Cadastro;
