import { useCSVDownloader } from 'react-papaparse';

export default function CSVDownloaderInput({ label, slug, data }) {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <CSVDownloader
      type={Type.Button}
      filename={`${slug}-template`}
      bom
      config={{
        delimiter: ',',
      }}
      data={data}
    >
      <div className="btn btn-primary gap-2">
        <i className="bi bi-cloud-arrow-down-fill text-lg" />
        {label}
      </div>
    </CSVDownloader>
  );
}
