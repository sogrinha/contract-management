import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import { FormField } from "../../components/FormField";
import SelectInput from "../../components/SelectedInput";
import { MyCEPInput } from "../../components/inputs/InputCep";
import { Lessee } from "../../models/Lessee";
import { Owner } from "../../models/Owner";
import {
  ERealEstateKind,
  EStatusRealEstate,
  RealEstate,
} from "../../models/RealEstate";
import { db } from "../../services/firebase";
import {
  createRealEstate,
  getRealEstateById,
  updateRealEstate,
} from "../../services/realEstateService";

interface SelectOption {
  value: string;
  label: string;
}

const CreateRealEstate = () => {
  const { id } = useParams<{ id?: string }>();
  const [realEstateData, setRealEstateData] = useState<RealEstate>();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lessees, setLessees] = useState<Lessee[]>([]);
  const [selectedInspection, setSelectedInspection] =
    useState<SelectOption | null>(null);
  const [selectedHasProofDocument, setSelectedHasProofDocument] =
    useState<SelectOption | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(
    null
  );
  const [selectedRealEstateKind, setSelectedRealEstateKind] =
    useState<SelectOption | null>(null);

  const [selectedOwner, setSelectedOwner] = useState<SelectOption | null>(null);
  const [selectedLessee, setSelectedLessee] = useState<SelectOption | null>(
    null
  );

  const enumToOptions = (enumObj: Record<string, string>) => {
    return Object.values(enumObj).map((value) => ({
      value,
      label: value,
    }));
  };

  useEffect(() => {
    const fetchOwnersAndLessees = async () => {
      try {
        const ownersQuery = query(collection(db, "owners"));
        const ownersSnapshot = await getDocs(ownersQuery);
        const ownersList = ownersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Owner[];
        setOwners(ownersList);

        const lesseesQuery = query(collection(db, "lessees"));
        const lesseesSnapshot = await getDocs(lesseesQuery);
        const lesseesList = lesseesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Lessee[];
        setLessees(lesseesList);
      } catch (error) {
        console.error("Erro ao buscar proprietários e locatários:", error);
        toast.error("Erro ao buscar proprietários e locatários.");
      }
    };

    fetchOwnersAndLessees();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await getRealEstateById(id);
          if (response) {
            setRealEstateData(response);
            console.log("resposta", response);

            setSelectedStatus(
              response.statusRealEstate
                ? {
                    value: response.statusRealEstate,
                    label: response.statusRealEstate,
                  }
                : null
            );
            setSelectedRealEstateKind(
              response.realEstateKind
                ? {
                    value: response.realEstateKind,
                    label: response.realEstateKind,
                  }
                : null
            );
            setSelectedInspection(
              response.hasInspection
                ? { value: "true", label: "Sim" }
                : { value: "false", label: "Não" }
            );
            setSelectedHasProofDocument(
              response.hasProofDocument
                ? { value: "true", label: "Sim" }
                : { value: "false", label: "Não" }
            );

            // Buscar os dados do proprietário
            if (response.owner) {
              const ownerDoc = await getDoc(response.owner);
              if (ownerDoc.exists()) {
                const ownerData = ownerDoc.data();
                setSelectedOwner({
                  value: ownerDoc.id,
                  label: ownerData.fullName,
                });
              }
            }

            // Buscar os dados do locatário (se houver)
            if (response.lessee) {
              const lesseeDoc = await getDoc(response.lessee);
              if (lesseeDoc.exists()) {
                const lesseeData = lesseeDoc.data();
                setSelectedLessee({
                  value: lesseeDoc.id,
                  label: lesseeData.fullName,
                });
              }
            }
          } else {
            toast.error("Imóvel não encontrado");
          }
        } catch (e) {
          toast.error("Erro ao buscar imóvel");
        }
      }
    };
    fetchData();
  }, [id]);

  const validationSchema = Yup.object().shape({
    municipalRegistration: Yup.string().required(
      "Número municipal é obrigatório"
    ),
    state: Yup.string().required("Estado é obrigatório"),
    city: Yup.string().required("Cidade é obrigatória"),
    neighborhood: Yup.string().required("Bairro é obrigatório"),
    street: Yup.string().required("Rua é obrigatória"),
    number: Yup.string().required("Número é obrigatório"),
    cep: Yup.string().required("CEP é obrigatório"),
    realEstateKind: Yup.object().shape({
      value: Yup.string().required("Tipo de imóvel é obrigatório"),
    }),
    statusRealEstate: Yup.object().shape({
      value: Yup.string().required("Status do imóvel é obrigatório"),
    }),
    owner: Yup.object().shape({
      value: Yup.string().required("Proprietário é obrigatório"),
    }),
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const ownerRef = doc(
        db,
        "owners",
        selectedOwner?.value || ""
      ) as DocumentReference<Owner>;
      let lesseeRef: DocumentReference<Lessee> | null = null;

      if (selectedLessee?.value) {
        lesseeRef = doc(
          db,
          "lessees",
          selectedLessee.value
        ) as DocumentReference<Lessee>;
      }

      const realEstate: RealEstate = {
        ...values,
        owner: ownerRef,
        lessee: lesseeRef === null ? null : lesseeRef,
        hasInspection: selectedInspection?.value === "true",
        hasProofDocument: selectedHasProofDocument?.value === "true",
        realEstateKind: selectedRealEstateKind?.value,
        statusRealEstate: selectedStatus?.value,
      };

      if (id) {
        await updateRealEstate(id, realEstate);
      } else {
        await createRealEstate(realEstate);
      }
      toast.success("Imóvel salvo com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar imóvel:", error);
      toast.error("Erro ao cadastrar imóvel. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-4/5 my-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {id ? "Editar Imóvel" : "Cadastro de Imóvel"}
        </h2>
        <Formik
          initialValues={{
            municipalRegistration: realEstateData?.municipalRegistration || "",
            state: realEstateData?.state || "",
            city: realEstateData?.city || "",
            neighborhood: realEstateData?.neighborhood || "",
            street: realEstateData?.street || "",
            number: realEstateData?.number || "",
            complement: realEstateData?.complement || "",
            cep: realEstateData?.cep || "",
            note: realEstateData?.note || "",
            realEstateKind: selectedRealEstateKind || { value: "", label: "" },
            statusRealEstate: selectedStatus || { value: "", label: "" },
            owner: selectedOwner || { value: "", label: "" },
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={!!id}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    label="Número Municipal"
                    name="municipalRegistration"
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Imóvel
                    </label>
                    <SelectInput
                      value={selectedRealEstateKind}
                      onChange={(option) => {
                        setSelectedRealEstateKind(option);
                        setFieldValue("realEstateKind", option);
                      }}
                      options={enumToOptions(ERealEstateKind)}
                    />
                    {errors.realEstateKind?.value && touched.realEstateKind && (
                      <div className="text-red-500 text-sm">
                        {errors.realEstateKind.value}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <SelectInput
                      value={selectedStatus}
                      onChange={(option) => {
                        setSelectedStatus(option);
                        setFieldValue("statusRealEstate", option);
                      }}
                      options={enumToOptions(EStatusRealEstate)}
                    />
                    {errors.statusRealEstate && touched.statusRealEstate && (
                      <div className="text-red-500 text-sm">
                        {errors.statusRealEstate.value}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Possui Vistoria?
                    </label>
                    <SelectInput
                      value={selectedInspection}
                      onChange={(option) => setSelectedInspection(option)}
                      options={[
                        { value: "true", label: "Sim" },
                        { value: "false", label: "Não" },
                      ]}
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Possui Documentação?
                    </label>
                    <SelectInput
                      value={selectedHasProofDocument}
                      onChange={(option) => setSelectedHasProofDocument(option)}
                      options={[
                        { value: "true", label: "Sim" },
                        { value: "false", label: "Não" },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proprietário
                  </label>
                  <SelectInput
                    value={selectedOwner}
                    onChange={(option) => {
                      setSelectedOwner(option);
                      setFieldValue("owner", option); // Atualiza o Formik
                    }}
                    options={owners.map((owner) => ({
                      value: owner.id ?? "",
                      label: owner.fullName,
                    }))}
                  />
                  {errors.owner && touched.owner && (
                    <div className="text-red-500 text-sm">
                      {errors.owner.value}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locatário (Opcional)
                  </label>
                  <SelectInput
                    value={selectedLessee}
                    onChange={(option) => setSelectedLessee(option)}
                    options={lessees.map((lessee) => ({
                      value: lessee.id ?? "",
                      label: lessee.fullName,
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <FormField label="Estado" name="state" />
                <FormField label="Cidade" name="city" />
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormField label="Bairro" name="neighborhood" />
                </div>
                <div className="col-span-4">
                  <FormField label="Rua" name="street" />
                </div>
                <div className="col-span-2">
                  <FormField label="Número" name="number" />
                </div>
                <div className="col-span-2">
                  <FormField label="Complemento" name="complement" />
                </div>
              </div>
              <div className="grid grid-cols-1">
                <FormField
                  label="Observação"
                  name="note"
                  component="textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-myPrimary text-white py-2 rounded hover:bg-opacity-90 focus:outline-none"
              >
                {isSubmitting ? "Salvando..." : "Salvar Imóvel"}
              </button>
            </Form>
          )}
        </Formik>
        <ToastContainer position="top-right" autoClose={1500} />
      </div>
    </div>
  );
};

export default CreateRealEstate;
