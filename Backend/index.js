const startApp=require('./app');
const PORT=process.env.PORT || 3000;    

const initializeApp=async()=>{
    const app=await startApp();
    if(app){
        app.get('/',(req,res)=>{
            res.send('portal is running perfectly!!');
        });

        app.listen(PORT,()=>{
            console.log(`Server is running on port ${PORT}`);
        });
    }
}
initializeApp();