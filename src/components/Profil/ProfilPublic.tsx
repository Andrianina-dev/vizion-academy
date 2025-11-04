import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import type { FileUploadSelectEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { ProgressBar } from 'primereact/progressbar';
import { useRef } from 'react';
import { Divider } from 'primereact/divider';

interface ProfilPublicProps {
  className?: string;
}

const ProfilPublic: React.FC<ProfilPublicProps> = ({ className = '' }) => {
  const [intervenantId, setIntervenantId] = useState<string>('');
  const [profil, setProfil] = useState({
    nom_intervenant: '',
    prenom_intervenant: '',
    photo_intervenant: '',
    photo_url: '',
    bio_intervenant: '',
    competences: '',
    disponibilite: '',
    documents: '',
    documents_url: '',
    cv_url: '',
    domaines: [] as string[],
    langues: [] as string[],
    ville: '',
    diplome: '',
    date_creation: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    try {
      setLoading(true);
      
      const rawIntervenant = localStorage.getItem('intervenant_connecte');
      
      if (!rawIntervenant) {
        throw new Error('Aucun intervenant connecté trouvé');
      }
      
      const intervenant = JSON.parse(rawIntervenant);
      const intervenantId = intervenant.id || intervenant.id_intervenant || (intervenant.data && intervenant.data.id_intervenant);
      
      if (!intervenantId) {
        throw new Error('ID de l\'intervenant non trouvé');
      }
      
      setIntervenantId(intervenantId.toString());

      const url = `${import.meta.env.VITE_API_URL}/api/intervenants/${intervenantId}/profil`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProfil({
          ...data.data,
          competences: data.data.competences || '',
          documents: data.data.documents || '',
          documents_url: data.data.documents_url || '',
          photo_url: data.data.photo_url || '',
          cv_url: data.data.cv_url || '',
          domaines: Array.isArray(data.data.domaines) ? data.data.domaines : [],
          langues: Array.isArray(data.data.langues) ? data.data.langues : [],
        });
      } else {
        showError('Erreur lors du chargement du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showError('Une erreur est survenue lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfil(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (name: 'domaines' | 'langues', value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setProfil(prev => ({ ...prev, [name]: tags }));
  };

  const handleFileUpload = async (e: FileUploadSelectEvent) => {
    const file = e.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('La taille du fichier ne doit pas dépasser 2 Mo');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showError('Format de fichier non supporté. Utilisez JPEG, PNG ou GIF.');
      return;
    }

    try {
      setUploadProgress(30);
      
      const formData = new FormData();
      formData.append('photo_intervenant', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/intervenants/${intervenantId}/photo-profil`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de la photo');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setProfil(prev => ({
          ...prev,
          photo_intervenant: data.data.photo_intervenant || prev.photo_intervenant,
          photo_url: data.data.photo_url || prev.photo_url
        }));
        
        const intervenantConnecte = JSON.parse(localStorage.getItem('intervenant_connecte') || '{}');
        if (intervenantConnecte) {
          localStorage.setItem('intervenant_connecte', JSON.stringify({
            ...intervenantConnecte,
            photo_intervenant: data.data.photo_intervenant || intervenantConnecte.photo_intervenant,
            photo_url: data.data.photo_url || intervenantConnecte.photo_url
          }));
        }
        
        showSuccess('Photo de profil mise à jour avec succès');
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour de la photo');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      showError(error instanceof Error ? error.message : 'Erreur lors du téléchargement de la photo');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!intervenantId) {
        throw new Error('ID de l\'intervenant non trouvé');
      }

      // Créer un objet avec les valeurs actuelles du formulaire
      const formValues: Record<string, any> = {};
      
      // Récupérer les valeurs des champs texte
      document.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach(input => {
        if (input.name) {
          formValues[input.name] = input.value;
        }
      });
      
      // Récupérer les valeurs des zones de texte
      document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textarea => {
        if (textarea.name) {
          formValues[textarea.name] = textarea.value;
        }
      });
      
      // Vérifier les champs modifiés en comparant avec l'état initial
      const modifiedFields: Record<string, any> = {};
      
      // Vérifier les champs texte modifiés
      const textFields = ['nom_intervenant', 'prenom_intervenant', 'bio_intervenant', 'competences', 'disponibilite', 'ville', 'diplome'];
      textFields.forEach(field => {
        if (formValues[field] !== profil[field as keyof typeof profil]) {
          modifiedFields[field] = formValues[field];
        }
      });
      
      // Vérifier les fichiers
      const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
      fileInputs.forEach(input => {
        if (input.files && input.files.length > 0) {
          modifiedFields[input.name || 'photo_intervenant'] = input.files[0];
        }
      });
      
      // Vérifier les tableaux (domaines, langues)
      if (profil.domaines && profil.domaines.length > 0) {
        modifiedFields.domaines = profil.domaines;
      }
      
      if (profil.langues && profil.langues.length > 0) {
        modifiedFields.langues = profil.langues;
      }
      
      if (Object.keys(modifiedFields).length === 0) {
        showError('Aucune modification détectée');
        return;
      }
      
      const formData = new FormData();
      
      // Ajouter les champs modifiés au FormData
      Object.entries(modifiedFields).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
      
      // Envoyer la requête de mise à jour
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/intervenants/${intervenantId}/profil`, {
        method: 'PUT',
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la mise à jour du profil');
      }
      
      if (responseData.success) {
        // Si le serveur indique qu'aucune modification n'a été effectuée
        if (responseData.message === 'Aucune modification détectée') {
          showSuccess(responseData.message);
          setIsEditing(false);
          return;
        }
        
        // Si des données sont renvoyées, les utiliser pour mettre à jour le profil
        if (responseData.data) {
          const responseDataData = responseData.data;
          const updatedProfil = {
            ...profil,
            ...responseDataData,
            photo_url: responseDataData.photo_url || profil.photo_url,
            documents_url: responseDataData.documents_url || profil.documents_url,
            cv_url: responseDataData.cv_url || profil.cv_url,
            domaines: Array.isArray(responseDataData.domaines) ? responseDataData.domaines : (profil.domaines || []),
            langues: Array.isArray(responseDataData.langues) ? responseDataData.langues : (profil.langues || [])
          };
          
          setProfil(updatedProfil);
          
          // Mettre à jour le localStorage
          try {
            const intervenantConnecte = JSON.parse(localStorage.getItem('intervenant_connecte') || '{}');
            if (intervenantConnecte) {
              localStorage.setItem('intervenant_connecte', JSON.stringify({
                ...intervenantConnecte,
                ...responseDataData,
                photo_url: updatedProfil.photo_url,
                documents_url: updatedProfil.documents_url,
                cv_url: updatedProfil.cv_url,
                domaines: updatedProfil.domaines,
                langues: updatedProfil.langues
              }));
            }
          } catch (storageError) {
            console.warn('Erreur lors de la mise à jour du localStorage:', storageError);
            // Ne pas bloquer le flux en cas d'erreur de localStorage
          }
        }
        
        showSuccess(responseData.message || 'Profil mis à jour avec succès');
        setIsEditing(false);
      } else {
        // Si le serveur renvoie success: false mais avec un message
        if (responseData.message) {
          throw new Error(responseData.message);
        }
        throw new Error('Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 3000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 3000
    });
  };

  const getPhotoUrl = () => {
    if (profil.photo_url) {
      return profil.photo_url;
    }
    
    if (profil.photo_intervenant) {
      if (profil.photo_intervenant.startsWith('http')) {
        return profil.photo_intervenant;
      }
      
      return `${import.meta.env.VITE_API_URL}${profil.photo_intervenant.startsWith('/') ? '' : '/'}${profil.photo_intervenant}`;
    }
    
    return '/assets/images/avatar-default.png';
  };

  if (loading && !isEditing) {
    return (
      <div className="flex justify-content-center p-4">
        <div className="text-600 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className={`profil-public ${className}`}>
      <Toast ref={toast} />
      
      <div className="grid">
        {/* Colonne gauche - Photo et informations personnelles */}
        <div className="col-12 md:col-4">
          <Card className="shadow-1 mb-3" style={{ padding: '1.5rem' }}>
            <div className="text-center">
              <div className="relative mb-4">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img 
                      src={getPhotoUrl()} 
                      alt="Photo de profil" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/avatar-default.png';
                      }}
                    />
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <FileUpload
                        ref={fileUploadRef}
                        mode="basic"
                        name="photo_intervenant"
                        accept="image/*"
                        maxFileSize={2000000}
                        onSelect={handleFileUpload}
                        auto
                        chooseLabel=""
                        chooseOptions={{
                          icon: 'pi pi-camera',
                          className: 'p-button-rounded p-button-sm p-button-primary',
                          label: ''
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-2">
                  <ProgressBar value={uploadProgress} className="mb-1" style={{ height: '4px' }} />
                  <small className="text-600 text-xs">Téléchargement...</small>
                </div>
              )}
              
              <h2 className="text-lg font-bold mb-1 text-gray-900">
                {profil.prenom_intervenant} {profil.nom_intervenant}
              </h2>
              
              {profil.ville && (
                <div className="flex align-items-center justify-content-center text-600 text-sm mb-2">
                  <i className="pi pi-map-marker mr-1 text-xs"></i>
                  <span>{profil.ville}</span>
                </div>
              )}
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">{profil.bio_intervenant || 'Aucune bio renseignée'}</p>
                {profil.diplome && (
                  <p className="text-sm text-gray-700 font-medium">{profil.diplome}</p>
                )}
              </div>

              <div className="flex flex-wrap justify-content-center gap-1 mb-3">
                {profil.domaines.map((domaine, index) => (
                  <Tag key={index} value={domaine} className="text-xs bg-blue-50 text-blue-700 border-0" />
                ))}
              </div>
            </div>
            
            <Divider className="my-3" />
            
            <div className="flex justify-content-center gap-2">
              <Button 
                label={isEditing ? 'Annuler' : 'Modifier le profil'} 
                icon={isEditing ? 'pi pi-times' : 'pi pi-pencil'} 
                className="p-button-outlined p-button-sm w-full"
                onClick={() => {
                  if (isEditing) {
                    chargerProfil();
                  }
                  setIsEditing(!isEditing);
                }}
              />
              
              {isEditing && (
                <Button 
                  label="Enregistrer" 
                  icon="pi pi-save" 
                  className="p-button-sm w-full"
                  onClick={handleSave}
                  loading={loading}
                />
              )}
            </div>
          </Card>
        </div>
        
        {/* Colonne droite - Détails du profil */}
        <div className="col-12 md:col-8">
          <div className="grid">
            <div className="col-12 lg:col-8">
              <Card className="shadow-1 mb-3" style={{ padding: '1.5rem' }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Informations</h3>
                
                <div className="grid">
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-600 text-xs font-medium mb-1">Diplôme</label>
                    {isEditing ? (
                      <InputText
                        name="diplome"
                        value={profil.diplome || ''}
                        onChange={handleInputChange}
                        className="w-full text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{profil.diplome || 'Non renseigné'}</p>
                    )}
                  </div>
                  
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-600 text-xs font-medium mb-1">Ville</label>
                    {isEditing ? (
                      <InputText
                        name="ville"
                        value={profil.ville || ''}
                        onChange={handleInputChange}
                        className="w-full text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{profil.ville || 'Non renseignée'}</p>
                    )}
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="block text-600 text-xs font-medium mb-1">Disponibilité</label>
                    {isEditing ? (
                      <InputText
                        name="disponibilite"
                        value={profil.disponibilite || ''}
                        onChange={handleInputChange}
                        className="w-full text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{profil.disponibilite || 'Non spécifiée'}</p>
                    )}
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="block text-600 text-xs font-medium mb-1">Bio</label>
                    {isEditing ? (
                      <InputTextarea
                        name="bio_intervenant"
                        value={profil.bio_intervenant}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{profil.bio_intervenant || 'Aucune bio renseignée'}</p>
                    )}
                  </div>
                </div>
                
                <Divider className="my-3" />
                
                <div className="grid">
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-600 text-xs font-medium mb-2">Domaines d'expertise</label>
                    {isEditing ? (
                      <InputText
                        name="domaines"
                        value={profil.domaines.join(', ')}
                        onChange={(e) => handleTagsChange('domaines', e.target.value)}
                        className="w-full text-sm"
                        placeholder="Communication, Formation..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {profil.domaines.map((domaine, index) => (
                          <Chip key={index} label={domaine} className="text-xs bg-gray-100" />
                        ))}
                        {profil.domaines.length === 0 && <span className="text-400 text-sm">Aucun</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-12 md:col-6 mb-3">
                    <label className="block text-600 text-xs font-medium mb-2">Langues parlées</label>
                    {isEditing ? (
                      <InputText
                        name="langues"
                        value={profil.langues.join(', ')}
                        onChange={(e) => handleTagsChange('langues', e.target.value)}
                        className="w-full text-sm"
                        placeholder="Français, Anglais..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {profil.langues.map((langue, index) => (
                          <Chip key={index} label={langue} className="text-xs bg-gray-100" />
                        ))}
                        {profil.langues.length === 0 && <span className="text-400 text-sm">Aucune</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <Divider className="my-3" />
                
                <div className="mb-3">
                  <label className="block text-600 text-xs font-medium mb-2">Compétences</label>
                  {isEditing ? (
                    <InputTextarea
                      name="competences"
                      value={profil.competences}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full text-sm"
                      placeholder="Listez vos compétences..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profil.competences ? (
                        profil.competences.split(',').map((competence, index) => (
                          <Chip 
                            key={index} 
                            label={competence.trim()} 
                            className="text-xs bg-blue-50 text-blue-700"
                          />
                        ))
                      ) : (
                        <p className="text-400 text-sm">Aucune compétence renseignée</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            <div className="col-12 lg:col-4">
              <Card className="shadow-1" style={{ padding: '1.5rem' }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Statistiques</h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">24</div>
                    <div className="text-600 text-sm">Missions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">4.8</div>
                    <div className="text-600 text-sm">Note moyenne</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">18</div>
                    <div className="text-600 text-sm">Établissements</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">95%</div>
                    <div className="text-600 text-sm">Satisfaction</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilPublic;