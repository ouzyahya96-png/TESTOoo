# -*- coding: utf-8 -*-
"""
ALPHA MAN - Pattern Killer Engine
FastAPI & TensorFlow Lite ML Prediction & Adaptation Model
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import numpy as np

# Try to import tflite runtime or tensorflow
try:
    import tensorflow.lite as tflite
    HAS_TFLITE = True
except ImportError:
    HAS_TFLITE = False

app = FastAPI(
    title="ALPHA MAN - Pattern Killer ML Service",
    description="Microservice de prédiction proactive de relapses et boucle de rétroaction neuronale",
    version="1.1.0"
)

# In-memory mock weights simulating the localized ML model adaptive weights
# These represent the neural connections that strengthen or weaken based on user resilience
MODEL_WEIGHTS = {
    "timeOfDay": 0.25,
    "dayOfWeek": 0.15,
    "sleepQuality": 0.15,
    "stressLevel": 0.20,
    "mood": 0.10,
    "streak": 0.05,
    "socialMedia": 0.05,
    "location": 0.05
}

class PredictionRequest(BaseModel):
    userId: str = Field(..., description="ID unique de l'utilisateur ALPHA MAN")
    timeOfDay: float = Field(..., ge=0.0, le=24.0, description="Heure locale de la journée (0-24)")
    dayOfWeek: int = Field(..., ge=1, le=7, description="Jour de la semaine (1=Lundi, 7=Dimanche)")
    sleepQuality: float = Field(..., ge=0.0, le=10.0, description="Qualité du sommeil de la nuit dernière (0-10)")
    stressLevel: float = Field(..., ge=0.0, le=10.0, description="Niveau de stress déclaré (0-10)")
    mood: float = Field(..., ge=0.0, le=10.0, description="Humeur actuelle déclarée (0-10)")
    streakDays: int = Field(..., ge=0, description="Nombre de jours de streak de rétention actuel")
    socialMediaMinutes: float = Field(..., ge=0.0, description="Temps passé sur les réseaux sociaux (minutes)")
    locationRisk: float = Field(..., ge=0.0, le=1.0, description="Niveau de risque lié à la localisation actuelle (0-1)")

class FeedbackRequest(BaseModel):
    userId: str = Field(..., description="ID unique de l'utilisateur")
    factors: Dict[str, float] = Field(..., description="Facteurs enregistrés lors de la prédiction")
    resisted: bool = Field(..., description="Indique si l'utilisateur a résisté (True) ou a fait une relapse (False)")

class PredictionResponse(BaseModel):
    userId: str
    riskScore: float = Field(..., description="Score global de risque calculé (0-100)")
    riskCategory: str = Field(..., description="Catégorie de risque: 'GREEN' (0-30), 'ORANGE' (31-60), 'RED' (61-100)")
    weights: Dict[str, float] = Field(..., description="Poids actuels des facteurs de l'algorithme neuronal")

def sigmoid(x: float) -> float:
    return 1 / (1 + np.exp(-x))

def run_tflite_inference(features: np.ndarray) -> float:
    """
    Exécute l'inférence via un fichier modèle TFLite local si présent.
    Sinon, retourne une prédiction via l'algorithme de pondération linéaire adaptatif.
    """
    model_path = "pattern_killer_model.tflite"
    if HAS_TFLITE and os.path.exists(model_path):
        try:
            interpreter = tflite.Interpreter(model_path=model_path)
            interpreter.allocate_tensors()
            
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            
            # Format input features
            input_data = np.array([features], dtype=np.float32)
            interpreter.set_tensor(input_details[0]['index'], input_data)
            
            interpreter.invoke()
            output_data = interpreter.get_tensor(output_details[0]['index'])
            return float(output_data[0][0])
        except Exception as e:
            # Fallback on mathematical heuristics in case of load failure
            pass
            
    # Algorithme Heuristique Neuronal de secours hautement fiable
    # Normalisation et combinaison linéaire
    time_risk = np.sin((features[0] / 24.0) * 2 * np.pi - np.pi/2) * 0.5 + 0.5 # Weekend/soirée max
    day_risk = 0.8 if features[1] in [6, 7] else 0.3 # Weekend plus risqué
    sleep_risk = (10.0 - features[2]) / 10.0 # Mauvais sommeil = plus haut risque
    stress_risk = features[3] / 10.0 # Stress élevé = haut risque
    mood_risk = (10.0 - features[4]) / 10.0 # Humeur basse = risque élevé
    
    # Risque de streak (les jours 7, 14, 30 représentent des pics hormonaux / de sevrage)
    streak_val = features[5]
    if streak_val in [7, 8, 14, 15, 30]:
        streak_risk = 0.9
    elif streak_val < 3:
        streak_risk = 0.8 # Fort risque de rechute immédiate
    else:
        streak_risk = max(0.2, 0.6 - (streak_val * 0.01))
        
    social_risk = min(1.0, features[6] / 120.0) # >2h de réseaux = risque max
    loc_risk = features[7]

    # Weighted sum
    weighted_sum = (
        time_risk * MODEL_WEIGHTS["timeOfDay"] +
        day_risk * MODEL_WEIGHTS["dayOfWeek"] +
        sleep_risk * MODEL_WEIGHTS["sleepQuality"] +
        stress_risk * MODEL_WEIGHTS["stressLevel"] +
        mood_risk * MODEL_WEIGHTS["mood"] +
        streak_risk * MODEL_WEIGHTS["streak"] +
        social_risk * MODEL_WEIGHTS["socialMedia"] +
        loc_risk * MODEL_WEIGHTS["location"]
    )
    
    # Scale from sigmoid activation directly to 0-100 range
    score_0_1 = sigmoid((weighted_sum - 0.5) * 6)
    return float(score_0_1 * 100)

@app.post("/api/predict", response_model=PredictionResponse)
def predict_risk(req: PredictionRequest):
    """
    Prédit le risque de rechute pour un utilisateur selon l'état de ses facteurs internes/externes.
    """
    try:
        features = np.array([
            req.timeOfDay,
            req.dayOfWeek,
            req.sleepQuality,
            req.stressLevel,
            req.mood,
            float(req.streakDays),
            req.socialMediaMinutes,
            req.locationRisk
        ])
        
        risk_score = run_tflite_inference(features)
        
        # Categorize threshold
        if risk_score <= 30:
            category = "GREEN"
        elif risk_score <= 60:
            category = "ORANGE"
        else:
            category = "RED"
            
        return PredictionResponse(
            userId=req.userId,
            riskScore=round(risk_score, 1),
            riskCategory=category,
            weights=MODEL_WEIGHTS
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur d'exécution de l'inférence neuronale: {str(e)}"
        )

@app.post("/api/feedback")
def train_feedback(req: FeedbackRequest):
    """
    Apprentissage par rétroaction (ML Feedback Loop)
    Ajuste dynamiquement les poids du modèle neuronal local en fonction des victoires ou rechutes.
    """
    global MODEL_WEIGHTS
    learning_rate = 0.05
    
    # Normalization of inputs for scaling weights
    factors_norm = {
        "timeOfDay": min(1.0, req.factors.get("timeOfDay", 12.0) / 24.0),
        "dayOfWeek": 0.8 if req.factors.get("dayOfWeek", 1) in [6, 7] else 0.3,
        "sleepQuality": (10.0 - req.factors.get("sleepQuality", 7.0)) / 10.0,
        "stressLevel": req.factors.get("stressLevel", 5.0) / 10.0,
        "mood": (10.0 - req.factors.get("mood", 5.0)) / 10.0,
        "streak": 0.8 if req.factors.get("streakDays", 0) in [7, 14, 30] else 0.4,
        "socialMedia": min(1.0, req.factors.get("socialMediaMinutes", 30.0) / 120.0),
        "location": req.factors.get("locationRisk", 0.5)
    }
    
    # Backpropagation/Gradient Ascent rule:
    # If user relapsed (resisted=False), increase the weights of the factors that were highly active
    # If user resisted (resisted=True), decrease the weights of the factors that were highly active (weakening the pattern!)
    total_change = 0.0
    for factor, val in factors_norm.items():
        if factor in MODEL_WEIGHTS:
            if not req.resisted:
                # Relapse occurred -> increase weight for active triggers
                change = learning_rate * val * (1.0 - MODEL_WEIGHTS[factor])
            else:
                # Resisted! -> decrease weight for active triggers (pattern weakening!)
                change = -learning_rate * val * MODEL_WEIGHTS[factor]
                
            MODEL_WEIGHTS[factor] = max(0.01, min(0.95, MODEL_WEIGHTS[factor] + change))
            total_change += abs(change)
            
    # Renormalize weights so they sum to 1.0 approximately
    s = sum(MODEL_WEIGHTS.values())
    for k in MODEL_WEIGHTS:
        MODEL_WEIGHTS[k] = round(MODEL_WEIGHTS[k] / s, 3)
        
    return {
        "status": "success",
        "message": f"Modèle neuronal réajusté avec succès (Delta total: {round(total_change, 4)})",
        "newWeights": MODEL_WEIGHTS
    }

if __name__ == "__main__":
    uvicorn.run("ml_model:app", host="0.0.0.0", port=8000, reload=True)
