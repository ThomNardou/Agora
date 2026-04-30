export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
      <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : avril 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Responsable du traitement</h2>
        <p className="text-gray-700 leading-relaxed">
          La plateforme <strong>Agora</strong> est responsable du traitement des données personnelles
          collectées dans le cadre de ce service de diffusion de newsletters. 
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Agora collecte uniquement les données strictement nécessaires à la fourniture du service
          (principe de minimisation des données). Le tableau ci-dessous présente le modèle de
          classification des données appliqué :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Donnée</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Classification</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Mesure de protection</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Adresse e-mail</td>
                <td className="border border-gray-200 px-4 py-2 text-orange-600 font-medium">Sensible</td>
                <td className="border border-gray-200 px-4 py-2">Accès restreint aux administrateurs, stockage chiffré en transit (HTTPS)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">Date et heure d'inscription</td>
                <td className="border border-gray-200 px-4 py-2 text-green-600 font-medium">Interne</td>
                <td className="border border-gray-200 px-4 py-2">Accès restreint aux administrateurs, utilisé à des fins de traçabilité du consentement</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Token de désinscription</td>
                <td className="border border-gray-200 px-4 py-2 text-orange-600 font-medium">Sensible</td>
                <td className="border border-gray-200 px-4 py-2">Token unique généré et crypté, usage unique, invalidé après utilisation</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">Données de tracking (ouvertures, clics)</td>
                <td className="border border-gray-200 px-4 py-2 text-green-600 font-medium">Interne</td>
                <td className="border border-gray-200 px-4 py-2">Agrégées et pseudonymisées, visibles uniquement des administrateurs</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Statut d'abonnement (actif / inactif)</td>
                <td className="border border-gray-200 px-4 py-2 text-green-600 font-medium">Interne</td>
                <td className="border border-gray-200 px-4 py-2">Accès restreint aux administrateurs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Vos données personnelles sont traitées aux fins suivantes :
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Envoi de campagnes de newsletters auxquelles vous avez souscrit.</li>
          <li>Gestion de votre abonnement et de vos préférences de communication.</li>
          <li>Traçabilité de votre consentement conformément aux exigences légales.</li>
          <li>
            Mesure statistique de l'efficacité des campagnes (taux d'ouverture via pixel de
            suivi 1×1 px, taux de clic via réécriture des liens).
          </li>
          <li>Traitement des demandes de désinscription.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Base légale du traitement</h2>
        <p className="text-gray-700 leading-relaxed">
          Le traitement de vos données repose exclusivement sur votre <strong>consentement
          explicite</strong> (art. 6 al. 1 lit. a RGPD / LPD), matérialisé par la case à cocher
          lors de l'inscription. Vous pouvez retirer ce consentement à tout moment, sans que cela
          n'affecte la licéité du traitement effectué avant ce retrait.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Système de suivi (tracking)</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Afin de mesurer l'efficacité de nos campagnes, chaque newsletter envoyée intègre
          automatiquement les mécanismes suivants :
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Pixel de suivi (1×1 px) :</strong> une image invisible est incluse dans
            l'e-mail. Son chargement nous indique que le message a été ouvert, ainsi que la
            date et l'heure approximative de l'ouverture.
          </li>
          <li>
            <strong>Réécriture des liens :</strong> les liens contenus dans la newsletter sont
            redirigés via notre serveur afin d'enregistrer les clics avant de vous rediriger
            vers la destination finale. Aucune donnée personnelle supplémentaire n'est
            collectée lors de cette opération.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-3">
          Ces données de suivi sont agrégées et utilisées uniquement à des fins statistiques
          internes. Elles ne sont pas transmises à des tiers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Durée de conservation</h2>
        <p className="text-gray-700 leading-relaxed">
          Vos données sont conservées tant que votre abonnement est actif. À la suite d'une
          désinscription, votre adresse e-mail est <strong>anonymisée</strong> dans un délai de{" "}
          <strong>30 jours</strong> : elle est remplacée par un identifiant non réidentifiable,
          de sorte qu'aucune donnée ne puisse vous être rattachée. Les données statistiques et de
          traçabilité du consentement, désormais anonymisées, peuvent être conservées
          indéfiniment à des fins d'analyse et de conformité légale.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Vos droits</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Conformément à la LPD (Loi fédérale sur la protection des données) et au RGPD, vous
          disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Droit d'accès :</strong> obtenir une copie des données vous concernant.</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes.</li>
          <li>
            <strong>Droit à l'effacement :</strong> demander la suppression de vos données
            (droit de quitter l'Agora).
          </li>
          <li>
            <strong>Droit d'opposition :</strong> vous opposer au traitement de vos données à
            des fins de marketing.
          </li>
          <li>
            <strong>Droit au retrait du consentement :</strong> exercé à tout moment via le
            lien de désinscription présent dans chaque e-mail.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-3">
          Pour exercer ces droits, contactez-nous directement ou utilisez le lien de
          désinscription inclus dans chaque newsletter.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Désinscription</h2>
        <p className="text-gray-700 leading-relaxed">
          Chaque newsletter contient un <strong>lien de désinscription unique et sécurisé</strong>,
          généré cryptographiquement pour chaque destinataire. En cliquant sur ce lien, vous
          accédez à une page publique de gestion de vos préférences qui vous permet de vous
          désabonner immédiatement. Le token associé est invalidé après usage afin de prévenir
          toute utilisation frauduleuse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Sécurité des données</h2>
        <p className="text-gray-700 leading-relaxed">
          Agora met en œuvre les mesures techniques et organisationnelles appropriées pour
          protéger vos données contre tout accès non autorisé, divulgation, altération ou
          destruction : chiffrement des communications (HTTPS/TLS), accès restreint par
          authentification administrateur, principe du moindre privilège (RBAC), et génération
          sécurisée des tokens de désinscription.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Partage des données</h2>
        <p className="text-gray-700 leading-relaxed">
          Vos données personnelles ne sont <strong>jamais vendues ni cédées</strong> à des tiers.
          Elles peuvent être transmises à l'API d'envoi d'e-mails utilisée par la plateforme
          (adresse de destination uniquement), dans le strict cadre de la fourniture du service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Modifications de cette politique</h2>
        <p className="text-gray-700 leading-relaxed">
          Nous nous réservons le droit de modifier cette politique de confidentialité. Toute
          modification substantielle vous sera communiquée par e-mail avant son entrée en vigueur.
          La date de dernière mise à jour figure en haut de ce document.
        </p>
      </section>

      <div className="mt-10 pt-6 border-t border-gray-200 text-center">
        <a
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à l'inscription
        </a>
      </div>
    </div>
  );
}
