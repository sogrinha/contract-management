import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/inputStyles.css';
import {
  createOwner,
  updateOwner,
  getOwnerById,
} from '../../services/ownerServices';
import { useAuth } from '../../context/AuthContext';
import { MyRGInput } from '../../components/inputs/InputRG';
import { MyCPFInput } from '../../components/inputs/InputCPF';
import { MyCelphoneInput } from '../../components/inputs/InputCelphone';
import { MyCEPInput } from '../../components/inputs/InputCep';
import { FormField } from '../../components/FormField';
import SelectField from '../../components/SelectField';
import { EMaritalStatus } from '../../models/Enums/EMaritalStatus';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createEmptyOwner, Owner } from '../../models/Owner';

const OwnerRegistration = () => {
  const { user } = useAuth();

  const { id } = useParams<{ id?: string }>();
  const [ownerData, setOwnerData] = useState<Owner>(createEmptyOwner());

  useEffect(() => {
    const fetchData = async () => {
      // Função assíncrona interna
      if (id) {
        try {
          const response = await getOwnerById(id);
          if (response) {
            console.log('resposta', response);
            setOwnerData(response);
          } else {
            toast.error('Proprietário não encontrado');
          }
        } catch (e) {
          toast.error('Erro ao buscar Proprietário');
        }
      } else {
        // Lógica para criar um novo proprietário
        console.log('Criando novo proprietário');
      }
    };

    fetchData();
  }, [id]);

  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Nome completo é obrigatório'),
    rg: Yup.string().required('RG é obrigatório'),
    issuingBody: Yup.string().required('Órgão emissor é obrigatório'),
    cpf: Yup.string()
      .required('CPF é obrigatório')
      .matches(cpfRegex, 'CPF inválido'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    celphone: Yup.string().required('Celular é obrigatório'),
    state: Yup.string().required('Estado é obrigatório'),
    city: Yup.string().required('Cidade é obrigatória'),
    neighborhood: Yup.string().required('Bairro é obrigatório'),
    street: Yup.string().required('Rua é obrigatória'),
    number: Yup.string().required('Número é obrigatório'),
    complement: Yup.string(),
    cep: Yup.string().required('CEP é obrigatório'),
    note: Yup.string(),
    maritalStatus: Yup.string().required('Estado civil é obrigatório'),
    profession: Yup.string().required('Profissão é obrigatória'),
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      id
        ? await await updateOwner(id, values)
        : await createOwner({ userId: user?.uid || '', ...values });
      toast.success('Proprietário salvo com sucesso!');
      resetForm();
    } catch (error) {
      console.error('Erro ao cadastrar proprietário:', error);
      toast.error('Erro ao cadastrar proprietário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white p-8 rounded shadow-md w-4/5 mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Cadastro de Proprietário
        </h2>
        <Formik
          initialValues={ownerData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Nome Completo" name="fullName" />
                <SelectField
                  label="Estado Civíl"
                  name="maritalStatus"
                  options={Object.values(EMaritalStatus)}
                />
                <FormField label="Profissão" name="profession" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Email" name="email" type="email" />
                <FormField
                  label="Celular"
                  name="celphone"
                  type="tel"
                  component={MyCelphoneInput}
                />
                <FormField label="CPF" name="cpf" component={MyCPFInput} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="RG" name="rg" component={MyRGInput} />
                <FormField label="Órgão Emissor" name="issuingBody" />
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="cep"
                  >
                    CEP
                  </label>
                  <Field name="cep" component={MyCEPInput} />
                  <ErrorMessage
                    name="cep"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Estado" name="state" />
                <FormField label="Cidade" name="city" />
                <FormField label="Bairro" name="neighborhood" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Logradouro" name="street" />
                <FormField label="Número" name="number" />
                <FormField label="Complemento" name="complement" />
              </div>
              <div className="grid grid-1">
                <FormField
                  label="Observação"
                  name="note"
                  component="textarea"
                />
              </div>

              <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Informações do Sócio/Cônjuge
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Nome Completo" name="fullNamePartner" />
                  <FormField label="Email" name="emailPartner" type="email" />
                  <FormField
                    label="Celular"
                    name="celphonePartner"
                    type="tel"
                    component={MyCelphoneInput}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="CPF"
                    name="cpfPartner"
                    component={MyCPFInput}
                  />
                  <FormField
                    label="RG"
                    name="rgPartner"
                    component={MyRGInput}
                  />
                  <FormField label="Órgão Emissor" name="issuingBodyPartner" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="cep"
                    >
                      CEP
                    </label>
                    <Field
                      component={MyCEPInput}
                      name="cepPartner"
                      streetField="streetPartner"
                      neighborhoodField="neighborhoodPartner"
                      cityField="cityPartner"
                      stateField="statePartner"
                    />
                    <ErrorMessage
                      name="cep"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <FormField label="Estado" name="statePartner" />
                  <FormField label="Cidade" name="cityPartner" />
                </div>
                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-4">
                    <FormField label="Bairro" name="neighborhoodPartner" />
                  </div>
                  <div className="col-span-4">
                    <FormField label="Logradouro" name="streetPartner" />
                  </div>
                  <div className="col-span-2">
                    <FormField label="Número" name="numberPartner" />
                  </div>
                  <div className="col-span-2">
                    <FormField label="Complemento" name="complementPartner" />
                  </div>
                </div>
                <div className="grid grid-cols-3 mt-4"></div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-myPrimary text-white py-2 rounded hover:bg-pink-600 focus:outline-none focus:ring pink-focus-input"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Proprietário'}
              </button>
            </Form>
          )}
        </Formik>
        <ToastContainer position="top-right" autoClose={1500} />
      </div>
    </div>
  );
};

export default OwnerRegistration;
