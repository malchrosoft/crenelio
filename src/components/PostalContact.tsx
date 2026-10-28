import React from 'react';

interface PostalContactProps {
  name?: string | null;
  /** Une entrée par ligne (rue, code postal et ville…). */
  addressLines?: string[];
  phone?: string | null;
  email?: string | null;
}

/**
 * Bloc de coordonnées au format postal : nom et adresse ligne par ligne, puis un paragraphe
 * « Contact » distinct (téléphone, email). Utilisé partout où une identité est présentée
 * (mentions légales, politique de confidentialité…) pour un rendu homogène et aéré.
 */
const PostalContact: React.FC<PostalContactProps> = ({ name, addressLines = [], phone, email }) => (
  <div className="postal-contact">
    {(name || addressLines.length > 0) && (
      <address className="postal-contact__address">
        {name && <strong className="postal-contact__name">{name}</strong>}
        {addressLines.map((line) => (
          <span key={line} className="postal-contact__line">
            {line}
          </span>
        ))}
      </address>
    )}
    {(phone || email) && (
      <p className="postal-contact__contact">
        <span className="postal-contact__label">Contact</span>
        {phone && (
          <span className="postal-contact__line">
            Tél. : <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
          </span>
        )}
        {email && (
          <span className="postal-contact__line">
            Email : <a href={`mailto:${email}`}>{email}</a>
          </span>
        )}
      </p>
    )}
  </div>
);

export default PostalContact;
