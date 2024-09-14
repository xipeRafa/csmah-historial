import { useState, useEffect } from "react";
import "./css/App.css";
import Resizer from "react-image-file-resizer";

import {
    getDocs,
    collection,
    updateDoc,
    doc,
    addDoc,
    where,
    query,
} from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

import { firestoreDB, storageDocs } from "./firebase/firebaseConfig";




function App() {



    const [count, setCount] = useState(0);

    const [spinnerState, setSpinnerState]=useState(false)

    const resizeFile = (file) => {
        return new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                1112,
                1112,
                "JPEG",
                80,
                0,
                (uri) => {
                    //console.log('uri:', uri);
                    resolve(uri);
                },
                "base64",
            );
        }).catch((error) => {
            console.log(error);
            console.log("SE MAMARON!!");
            alert("El Archivo Cargado No es una Imagen");
        });
    };

    const [fileState, setFileState] = useState([]);


    const handlerArr=(file)=>{
        setFileState(fileState=>[...fileState, file]);
    }
    
 

    const onResize = async (fileArg) => {
        setEmptyFile(true);

        //const file = event;

        const image = await resizeFile(fileArg);

        fetch(image)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File(
                    [blob],
                    fileArg.name.split('.')[0] + ".jpeg",
                    { type: "image/jpeg" },
                );

                handlerArr(file)

            })
            .catch((error) => {
                console.log(error);
                console.log("SE MAMARON onResize!!");
            });
    };






    const [emptyName, setEmptyName] = useState(true);
    const [emptyDate, setEmptyDate] = useState(true);
    const [emptyFile, setEmptyFile] = useState(true);



    const [objectState, setObjectState] = useState({
        texto: "",
        fecha: "",
    });



    const { texto, fecha } = objectState;



    const handlerObjectsState = ({ target }) => {
        setEmptyName(true);
        setEmptyDate(true);
        const { name, value } = target;
        setObjectState({ ...objectState, [name]: value });
    };




  
     const [linksState, setLinksState] = useState([]);


    const saveLinks=(url)=>{
        setLinksState(linksState=>[...linksState, url]);
    }

localStorage.setItem('urlArr', JSON.stringify(linksState))

    const postCollection = collection(firestoreDB, "CSMA-historial");

    const postFile = (selectedFile, postBody) => {
       
        selectedFile.map((el, i)=>{

            const filesFolderRef = ref(storageDocs,`Files/${Date.now()}/${el.name}`);

            uploadBytes(filesFolderRef, el)
                .then(() => {
                    getDownloadURL(filesFolderRef).then((url) => {
                        saveLinks(url)
                    });
                })
                .catch((error) => {
                    console.log("postFile Error, App,jsx");
                    console.log(error);
                });

        })
      
    };



    const postBodyToFirebase =()=>{

            setSpinnerState(true)
     
            setTimeout(()=>{
                objectState.urlArr = JSON.parse(localStorage.urlArr)
                addDoc(postCollection, objectState)  
           },1500)

            setTimeout(()=>{
                setLinksState([])
                setSpinnerState(false)
           },3000)
           
    }
    
    



    const submit = () => {
        if (texto.length <= 0) {
            setEmptyName("El Texto esta Vacio");
            return;
        }

        if (fecha.length <= 0) {
            setEmptyDate("La Fecha esta Vacia");
            return;
        }

        if (fileState.length <= 0) {
            setEmptyFile("No Hay Archivo Seleccionado");
            return;
        }

        postFile(fileState, objectState)

        setTimeout(()=>{
            if (confirm(`Se ha Guardado el Evento`)) {

                postBodyToFirebase()

                setTimeout(()=>{
                    setObjectState({ texto: "", fecha: "" });
                    setFileState("");
                },1000)

            }
        },1000)

       
         
    };








    const [dateFinderState, setDateFinderState] = useState('');


    const [CSMAState, setCSMAState] = useState([]);
    const [getArr, setGetArr] = useState(false);


    useEffect(() => {
        const data = query(
            collection(firestoreDB, 'CSMA-historial'),
            where("fecha", "==", dateFinderState),
        );

        getDocs(data)
            .then((resp) => {
                setCSMAState(
                    resp.docs.map((doc) => ({ ...doc.data() })),
                );
            })
            .catch((err) => {
                console.error(err);
            });
    }, [getArr]);






    const handleFileEvent =  (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)

        chosenFiles.map((el, i)=>{
            onResize(el)
        })
    }
 





    return (
        <div className="containerApp">

            <div className={spinnerState ? 'spinnerContainerHere' : 'spinnerContainer'}>
                <div className='spinner'></div>
            </div>

            <h1>
                <span onClick={() => setCount(0)}>CSMA</span>

                <span>CRONOLOGIA</span>

                <span
                    onClick={() => {
                        if (count < 10) {
                            setCount((count) => count + 1);
                        }
                    }}
                >
                    HERMOSILLO
                </span>
            </h1>

<hr />
            <div className="empty">{emptyName}</div>
            <div className="empty">{emptyDate}</div>
            <div className="empty">{emptyFile}</div>





            <div className={count > 9 ? "forms" : "d-none"}>
                <input
                    type="text"
                    name="texto"
                    value={texto}
                    placeholder="Texto..."
                    onChange={(e) => handlerObjectsState(e)}
                />

                <input
                    type="date"
                    name="fecha"
                    value={fecha}
                    className="saveDate"
                    onChange={(e) => handlerObjectsState(e)}
                />

                <input type="file" onChange={handleFileEvent}  multiple/>

                <button onClick={submit}>GUARDAR</button>

            </div>

            <br />


            <label for="start">Selecciona una Fecha</label>


            <input
                className="busquedaDate"
                id="start"
                type="date"
                onChange={(e) =>{setDateFinderState(e.target.value), setGetArr(!getArr)}}
            />





            <div className='galeryContainer'>
                {CSMAState.map((el, i) => (
                    <div key={i} className='galery'>
                        <p>{el.fecha}</p>
                        <p>{el.texto}</p>
                        

                        {el.urlArr?.map((el, i)=>{
                                return <img key={i} className='imgFile' src={el} />
                        })}

                    </div>
                ))}
            </div>




        </div>
    );
}

export default App;
