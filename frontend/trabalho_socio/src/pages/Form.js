import '../styles/Login.css';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import '../styles/form.css';

const PageFormulario = () => {
  useEffect(() => {
          document.title = 'Inscrição';
        }, []);
  const [formData, setFormData] = useState({
    // Folha 1
    userType: '',
    userName: '',
    birthDate: '',
    gender: '',
    nis: '',
    birthCity: '',
    birthUF: '',
    address: '',
    rg: '',
    rgIssuer: '',
    rgUF: '',
    cpf: '',
    birthCertificateNum: '',
    birthCertificateFolha: '',
    birthCertificateLivro: '',
    birthCertificateDate: '',
    motherName: '',
    responsibleName: '',
    responsibleRG: '',
    responsibleRG_Issuer: '',
    responsibleRG_UF: '',
    responsibleCPF: '',
    responsibleNIS: '',
    schoolStatus: '',
    schoolStatusNegativeReason: '',
    schoolName: '',
    scholarity: '',
    schoolGrade: '',
    schoolTurn: '',
    attendsEJA: '',
    ejaSegment: '',
    ejaSemester: '',
    forwarding: [],
    priorityAudience: [],
    benefits: [],
    crasName: '',
    crasAddress: '',
    crasEmail: '',
    crasPhone: '',
    filledBy: '',
    // Folha 2
    registrationType: 'MATRICULA',
    familyChief: '',
    familyReligion: '',
    workPlace: '',
    familyIncome: '',
    hasDisabledPerson: '',
    demographics: [],
    useMedication: '',
    isAllergic: '',
    technicianResponsible: '',
    generalResponsible: '',
    contactPhone: ''
  });

  // Estado para a lista dinâmica de membros da família
  const [familyMembers, setFamilyMembers] = useState([
    { name: '', kinship: '', age: '' }
  ]);

  // Função genérica para atualizar o estado dos inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Lógica para adicionar/remover itens de um array no estado
      setFormData(prev => {
        const list = prev[name] ? [...prev[name]] : [];
        if (checked) {
          list.push(value);
        } else {
          const index = list.indexOf(value);
          if (index > -1) {
            list.splice(index, 1);
          }
        }
        return { ...prev, [name]: list };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Funções para gerenciar a lista de membros da família
  const handleFamilyChange = (index, e) => {
    const newFamilyMembers = [...familyMembers];
    newFamilyMembers[index][e.target.name] = e.target.value;
    setFamilyMembers(newFamilyMembers);
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', kinship: '', age: '' }]);
  };

  const removeFamilyMember = (index) => {
    const newFamilyMembers = [...familyMembers];
    newFamilyMembers.splice(index, 1);
    setFamilyMembers(newFamilyMembers);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    const fullForm = {
      ...formData,
      familyMembers: familyMembers
    };
    console.log("Dados do Formulário Enviado:", fullForm);
    // Aqui você faria a chamada para a sua API (backend) para salvar os dados
    alert('Cadastro enviado! Verifique o console para ver os dados.');
  };

  return (
    <div className="form-container">
      <h1>Formulário de Inscrição</h1>
      <form onSubmit={handleSubmit}>
        
        {/* === FOLHA 1 === */}
        <fieldset>
          <legend>Identificação do Usuário</legend>
          
          <div className="form-group">
            <label>Nome do Usuário:</label>
            <input type="text" name="userName" value={formData.userName} onChange={handleChange} />
          </div>
          <div className="form-group-row">
            <div className="form-group">
                <label>Data de Nascimento:</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Sexo:</label>
                <label><input type="radio" name="gender" value="M" onChange={handleChange} /> M</label>
                <label><input type="radio" name="gender" value="F" onChange={handleChange} /> F</label>
            </div>
             <div className="form-group">
                <label>NIS:</label>
                <input type="text" name="nis" value={formData.nis} onChange={handleChange} />
            </div>
          </div>
          {/* Adicione outros campos de identificação aqui (Naturalidade, Endereço, RG, CPF, etc.) */}
        </fieldset>
        
        <fieldset>
          <legend>Filiação e Responsável Legal</legend>
           <div className="form-group">
            <label>Nome da Mãe:</label>
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
          </div>
           <div className="form-group">
            <label>Nome do Responsável Legal (caso não seja a mãe):</label>
            <input type="text" name="responsibleName" value={formData.responsibleName} onChange={handleChange} />
          </div>
          {/* Adicione outros campos do responsável aqui (RG, CPF, NIS, etc.) */}
        </fieldset>

        <fieldset>
          <legend>Situação Escolar</legend>
           <div className="form-group">
             <label>Frequenta Escola?</label>
             <label><input type="radio" name="schoolStatus" value="sim" onChange={handleChange} /> Sim</label>
             <label><input type="radio" name="schoolStatus" value="nao" onChange={handleChange} /> Não</label>
           </div>
           {/* Adicione outros campos da situação escolar aqui */}
        </fieldset>
        
        {/* === FOLHA 2 === */}
        <fieldset>
            <legend>Status da Inscrição</legend>
            <div className="form-group">
                 <label><input type="radio" name="registrationType" value="MATRICULA" checked={formData.registrationType === 'MATRICULA'} onChange={handleChange} /> Matrícula</label>
                 <label><input type="radio" name="registrationType" value="REMATRICULA" checked={formData.registrationType === 'REMATRICULA'} onChange={handleChange} /> Rematrícula</label>
            </div>
        </fieldset>

        <fieldset>
          <legend>Membros Familiares</legend>
          {familyMembers.map((member, index) => (
            <div key={index} className="family-member-row">
              <input type="text" name="name" placeholder="Nome" value={member.name} onChange={(e) => handleFamilyChange(index, e)} />
              <input type="text" name="kinship" placeholder="Grau de Parentesco" value={member.kinship} onChange={(e) => handleFamilyChange(index, e)} />
              <input type="text" name="age" placeholder="Idade" value={member.age} onChange={(e) => handleFamilyChange(index, e)} />
              <button type="button" onClick={() => removeFamilyMember(index)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={addFamilyMember}>Adicionar Membro</button>
        </fieldset>

        <fieldset>
            <legend>Dados Sobre a Família</legend>
            <div className="form-group">
                <label>Chefe da Família:</label>
                <label><input type="radio" name="familyChief" value="Mãe" onChange={handleChange} /> Mãe</label>
                <label><input type="radio" name="familyChief" value="Pai" onChange={handleChange} /> Pai</label>
                <label><input type="radio" name="familyChief" value="Avós" onChange={handleChange} /> Avós</label>
                <label><input type="radio" name="familyChief" value="Outros" onChange={handleChange} /> Outros</label>
            </div>
            <div className="form-group">
                <label>Renda Familiar:</label>
                <input type="text" name="familyIncome" value={formData.familyIncome} onChange={handleChange} />
            </div>
            {/* Adicione outros campos sobre a família aqui */}
        </fieldset>

        <button type="submit" className="submit-button">Enviar Cadastro</button>
      </form>
    </div>
  );
};

export default PageFormulario;