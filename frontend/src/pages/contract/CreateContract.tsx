import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { Formik, Form } from "formik";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import { FormField } from "../../components/FormField";
import SelectInput from "../../components/SelectedInput";
import { db } from "../../services/firebase";
import { Owner } from "../../models/Owner";
import { Lessee } from "../../models/Lessee";
import { RealEstate } from "../../models/RealEstate";
import { Contract, EContractKind, EStatus } from "../../models/Contract";
import { createContract, updateContract } from "../../services/contractService";
import RoutesName from "../../routes/Routes";

interface SelectOption {
  value: string;
  label: string;
}

const CreateContract = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [entityId, setEntityId] = useState<string | null>(id || null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lessees, setLessees] = useState<Lessee[]>([]);
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [identifier, setIdentifier] = useState<string | null>(null);

  const [selectedKind, setSelectedKind] = useState<SelectOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(
    null
  );
  const [selectedOwner, setSelectedOwner] = useState<SelectOption | null>(null);
  const [selectedLessee, setSelectedLessee] = useState<SelectOption | null>(
    null
  );
  const [selectedRealEstate, setSelectedRealEstate] = useState<SelectOption | null>(null);

  const enumToOptions = (enumObj: Record<string, string>) => {
    return Object.values(enumObj).map((value) => ({
      value,
      label: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownersSnap = await getDocs(query(collection(db, "owners")));
        setOwners(
          ownersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Owner[]
        );

        const lesseesSnap = await getDocs(query(collection(db, "lessees")));
        setLessees(
          lesseesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Lessee[]
        );

        const realEstatesSnap = await getDocs(query(collection(db, "realEstates")));
        setRealEstates(
          realEstatesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as RealEstate[]
        );

        if (id) {
          const contractDoc = await getDoc(doc(db, "contracts", id));
          if (contractDoc.exists()) {
            const contractData = contractDoc.data() as Contract;
            const owner = contractData.owner as DocumentReference<Owner>;
            const lessee = contractData.lessee
              ? (contractData.lessee as DocumentReference<Lessee>)
              : null;
            const realEstate = contractData.realEstate
              ? (contractData.realEstate as DocumentReference<RealEstate>)
              : null;

            setIdentifier(contractData.identifier || null);
            setSelectedKind({
              value: contractData.contractKind,
              label: contractData.contractKind,
            });
            setSelectedStatus({
              value: contractData.status,
              label: contractData.status,
            });
            setSelectedOwner({
              value: owner.id,
              label: contractData.ownerName || "Desconhecido",
            });
            if (lessee) {
              setSelectedLessee({
                value: lessee.id,
                label: contractData.lesseeName || "Desconhecido",
              });
            }
            if (realEstate) {
              const realEstateDoc = await getDoc(realEstate);
              if (realEstateDoc.exists()) {
                const realEstateData = realEstateDoc.data() as RealEstate;
                setSelectedRealEstate({
                  value: realEstate.id,
                  label: `${realEstateData.street}, ${realEstateData.number} - ${realEstateData.neighborhood}, ${realEstateData.city}/${realEstateData.state}`,
                });
              }
            }
          }
        }
      } catch (err) {
        toast.error("Erro ao buscar dados.");
      }
    };

    fetchData();
  }, [id]);

  const validationSchema = Yup.object().shape({
    userId: Yup.string().required("Campo obrigatório"),
    contractKind: Yup.object().shape({
      value: Yup.string().required("Campo obrigatório"),
      label: Yup.string().required("Campo obrigatório"),
    }),
    startDate: Yup.date().required("Campo obrigatório"),
    endDate: Yup.date().required("Campo obrigatório"),
    dayPayment: Yup.number()
      .required("Campo obrigatório")
      .min(1, "Dia inválido")
      .max(31, "Dia inválido"),
    paymentValue: Yup.number()
      .required("Campo obrigatório")
      .min(0, "Valor inválido"),
    duration: Yup.number()
      .required("Campo obrigatório")
      .min(1, "Duração inválida"),
    status: Yup.object().shape({
      value: Yup.string().required("Campo obrigatório"),
      label: Yup.string().required("Campo obrigatório"),
    }),
    owner: Yup.object().shape({
      value: Yup.string().required("Campo obrigatório"),
      label: Yup.string().required("Campo obrigatório"),
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
        selectedOwner?.value!
      ) as DocumentReference<Owner>;
      const lesseeRef = selectedLessee?.value
        ? (doc(
          db,
          "lessees",
          selectedLessee.value
        ) as DocumentReference<Lessee>)
        : null;
      const realEstateRef = selectedRealEstate?.value
        ? (doc(
          db,
          "realEstates",
          selectedRealEstate.value
        ) as DocumentReference<RealEstate>)
        : null;

      const newContract: Contract = {
        userId: values.userId,
        contractKind: selectedKind?.value!,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        dayPayment: Number(values.dayPayment),
        paymentValue: Number(values.paymentValue),
        duration: Number(values.duration),
        status: selectedStatus?.value!,
        owner: ownerRef,
        lessee: lesseeRef || undefined,
        realEstate: realEstateRef || undefined,
      };

      const cleanedContract = Object.fromEntries(
        Object.entries(newContract).filter(([_, v]) => v !== undefined)
      );

      if (id) {
        await updateContract(id, cleanedContract);
        toast.success("Contrato atualizado com sucesso!");
        setEntityId(id);
      } else {
        const docRef = await createContract(cleanedContract as Contract);
        toast.success("Contrato criado com sucesso!");
        navigate(`${RoutesName.CONTRACT}/${docRef.id}`);
        return;
      }
      resetForm();
      navigate(RoutesName.CONTRACTS);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar contrato.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white p-8 rounded shadow-md w-4/5 mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {id ? "Editar Contrato" : "Cadastro de Contrato"}
        </h2>
        <Formik
          initialValues={{
            userId: "",
            contractKind: selectedKind || { value: "", label: "" },
            startDate: "",
            endDate: "",
            dayPayment: "",
            paymentValue: "",
            duration: "",
            status: selectedStatus || { value: "", label: "" },
            owner: selectedOwner || { value: "", label: "" },
            lessee: selectedLessee || { value: "", label: "" },
            realEstate: selectedRealEstate || { value: "", label: "" },
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values, errors }) => (
            <Form className="space-y-4">
              <FormField label="ID do Usuário" name="userId" />

              {identifier && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificador do Contrato
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Tipo de Contrato</label>
                  <SelectInput
                    value={values.contractKind}
                    onChange={(opt) => {
                      setSelectedKind(opt);
                      setFieldValue("contractKind", opt);
                    }}
                    options={enumToOptions(EContractKind)}
                  />
                  {errors.contractKind?.value && (
                    <div className="text-red-500 text-sm">
                      {errors.contractKind.value}
                    </div>
                  )}
                </div>
                <div>
                  <label>Status</label>
                  <SelectInput
                    value={values.status}
                    onChange={(opt) => {
                      setSelectedStatus(opt);
                      setFieldValue("status", opt);
                    }}
                    options={enumToOptions(EStatus)}
                  />
                  {errors.status?.value && (
                    <div className="text-red-500 text-sm">
                      {errors.status.value}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Data de Início"
                  name="startDate"
                  type="date"
                />
                <FormField label="Data de Término" name="endDate" type="date" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Dia do Pagamento" name="dayPayment" />
                <FormField label="Valor do Pagamento" name="paymentValue" />
                <FormField label="Duração (meses)" name="duration" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Proprietário</label>
                  <SelectInput
                    value={values.owner}
                    onChange={(opt) => {
                      setSelectedOwner(opt);
                      setFieldValue("owner", opt);
                    }}
                    options={owners.map((o) => ({
                      value: o.id ?? "",
                      label: o.fullName,
                    }))}
                  />
                  {errors.owner?.value && (
                    <div className="text-red-500 text-sm">
                      {errors.owner.value}
                    </div>
                  )}
                </div>
                <div>
                  <label>Locatário (opcional)</label>
                  <SelectInput
                    value={values.lessee}
                    onChange={(opt) => {
                      setSelectedLessee(opt);
                      setFieldValue("lessee", opt);
                    }}
                    options={lessees.map((l) => ({
                      value: l.id ?? "",
                      label: l.fullName,
                    }))}
                  />
                </div>
                <div>
                  <label>Imóvel (opcional)</label>
                  <SelectInput
                    value={values.realEstate}
                    onChange={(opt) => {
                      setSelectedRealEstate(opt);
                      setFieldValue("realEstate", opt);
                    }}
                    options={realEstates.map((r) => ({
                      value: r.id ?? "",
                      label: `${r.street}, ${r.number} - ${r.neighborhood}, ${r.city}/${r.state}`,
                    }))}
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-myPrimary text-white py-2 rounded hover:bg-opacity-90 focus:outline-none"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Contrato"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <ToastContainer position="top-right" autoClose={1500} />
      </div>
    </div>
  );
};

export default CreateContract;
