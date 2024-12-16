import Candidate from "../models/Candidate.js";

export const addCandidate = async (req,res) => {

    try{

        const candidate = req.body;
        console.log(candidate)
        const savedCandidate = await Candidate.create(candidate)
        res.status(200).json({'message': 'Candidate saved successfully!', 'candidate': savedCandidate});
    }
    catch(err){
        console.log(err);
        res.status(500).json({'message': err});
    }


}
